import express from 'express';
import { pool } from '../db/connection.js';

const router = express.Router();

// GET /api/habits - Get all habits
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        t.id,
        t.title,
        t.description,
        t.completed,
        t.is_habit,
        t.created_at,
        t.updated_at,
        c.id as category_id,
        c.name as category,
        c.color as category_color,
        c.text_color as category_text_color,
        COALESCE(
          json_agg(
            json_build_object(
              'id', hh.id,
              'date', hh.date,
              'completed', hh.completed
            )
          ) FILTER (WHERE hh.id IS NOT NULL), 
          '[]'::json
        ) as habit_history
      FROM tasks t
      LEFT JOIN categories c ON t.category_id = c.id
      LEFT JOIN habit_history hh ON t.id = hh.task_id
      WHERE t.is_habit = true
      GROUP BY t.id, c.id, c.name, c.color, c.text_color
      ORDER BY t.created_at DESC`
    );
    
    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length
    });
    
  } catch (error) {
    console.error('Error fetching habits:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch habits',
      message: error.message
    });
  }
});

// GET /api/habits/:id - Get a specific habit with history
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      `SELECT 
        t.id,
        t.title,
        t.description,
        t.completed,
        t.is_habit,
        t.created_at,
        t.updated_at,
        c.id as category_id,
        c.name as category,
        c.color as category_color,
        c.text_color as category_text_color,
        COALESCE(
          json_agg(
            json_build_object(
              'id', hh.id,
              'date', hh.date,
              'completed', hh.completed
            )
          ) FILTER (WHERE hh.id IS NOT NULL), 
          '[]'::json
        ) as habit_history
      FROM tasks t
      LEFT JOIN categories c ON t.category_id = c.id
      LEFT JOIN habit_history hh ON t.id = hh.task_id
      WHERE t.id = $1 AND t.is_habit = true
      GROUP BY t.id, c.id, c.name, c.color, c.text_color`
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Habit not found'
      });
    }
    
    res.json({
      success: true,
      data: result.rows[0]
    });
    
  } catch (error) {
    console.error('Error fetching habit:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch habit',
      message: error.message
    });
  }
});

// POST /api/habits/:id/complete - Mark habit as completed for a specific date
router.post('/:id/complete', async (req, res) => {
  try {
    const { id } = req.params;
    const { date, completed = true } = req.body;
    
    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!date || !dateRegex.test(date)) {
      return res.status(400).json({
        success: false,
        error: 'Valid date (YYYY-MM-DD) is required'
      });
    }
    
    // Check if task exists and is a habit
    const taskResult = await pool.query(
      'SELECT * FROM tasks WHERE id = $1 AND is_habit = true',
      [id]
    );
    
    if (taskResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Habit not found'
      });
    }
    
    // Check if habit history entry already exists for this date
    const existingEntry = await pool.query(
      'SELECT * FROM habit_history WHERE task_id = $1 AND date = $2',
      [id, date]
    );
    
    let result;
    
    if (existingEntry.rows.length > 0) {
      // Update existing entry
      result = await pool.query(
        `UPDATE habit_history 
         SET completed = $1, updated_at = CURRENT_TIMESTAMP
         WHERE task_id = $2 AND date = $3
         RETURNING *`,
        [completed, id, date]
      );
    } else {
      // Insert new entry
      result = await pool.query(
        `INSERT INTO habit_history (task_id, date, completed) 
         VALUES ($1, $2, $3) 
         RETURNING *`,
        [id, date, completed]
      );
    }
    
    res.json({
      success: true,
      data: result.rows[0],
      message: `Habit ${completed ? 'completed' : 'uncompleted'} for ${date}`
    });
    
  } catch (error) {
    console.error('Error updating habit completion:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update habit completion',
      message: error.message
    });
  }
});

// GET /api/habits/:id/stats - Get habit statistics
router.get('/:id/stats', async (req, res) => {
  try {
    const { id } = req.params;
    const { days = 30 } = req.query;
    
    // Check if task exists and is a habit
    const taskResult = await pool.query(
      'SELECT * FROM tasks WHERE id = $1 AND is_habit = true',
      [id]
    );
    
    if (taskResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Habit not found'
      });
    }
    
    // Get habit history for the specified number of days
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    
    const result = await pool.query(
      `SELECT 
        hh.date,
        hh.completed,
        CASE 
          WHEN hh.completed THEN 1 
          ELSE 0 
        END as completion_value
      FROM habit_history hh
      WHERE hh.task_id = $1 
        AND hh.date >= $2 
        AND hh.date <= $3
      ORDER BY hh.date ASC`,
      [id, startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]]
    );
    
    // Calculate statistics
    const totalDays = result.rows.length;
    const completedDays = result.rows.filter(row => row.completed).length;
    const completionRate = totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0;
    
    // Calculate streak
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    
    for (let i = result.rows.length - 1; i >= 0; i--) {
      if (result.rows[i].completed) {
        tempStreak++;
        if (i === result.rows.length - 1) {
          currentStreak = tempStreak;
        }
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 0;
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak);
    
    res.json({
      success: true,
      data: {
        habitId: id,
        period: `${days} days`,
        totalDays,
        completedDays,
        completionRate: `${completionRate}%`,
        currentStreak,
        longestStreak,
        history: result.rows
      }
    });
    
  } catch (error) {
    console.error('Error fetching habit stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch habit statistics',
      message: error.message
    });
  }
});

// DELETE /api/habits/:id/history/:date - Remove habit history entry for a specific date
router.delete('/:id/history/:date', async (req, res) => {
  try {
    const { id, date } = req.params;
    
    // Check if task exists and is a habit
    const taskResult = await pool.query(
      'SELECT * FROM tasks WHERE id = $1 AND is_habit = true',
      [id]
    );
    
    if (taskResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Habit not found'
      });
    }
    
    const result = await pool.query(
      'DELETE FROM habit_history WHERE task_id = $1 AND date = $2 RETURNING *',
      [id, date]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Habit history entry not found'
      });
    }
    
    res.json({
      success: true,
      message: `Habit history entry for ${date} deleted successfully`,
      data: result.rows[0]
    });
    
  } catch (error) {
    console.error('Error deleting habit history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete habit history',
      message: error.message
    });
  }
});

// GET /api/habits/stats/overview - Get overview statistics for all habits
router.get('/stats/overview', async (req, res) => {
  try {
    const { days = 7 } = req.query;
    
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    
    const result = await pool.query(
      `SELECT 
        t.id,
        t.title,
        t.category_id,
        c.name as category_name,
        COUNT(hh.date) as total_entries,
        COUNT(CASE WHEN hh.completed THEN 1 END) as completed_entries,
        ROUND(
          (COUNT(CASE WHEN hh.completed THEN 1 END)::decimal / 
           NULLIF(COUNT(hh.date), 0) * 100), 1
        ) as completion_rate
      FROM tasks t
      LEFT JOIN categories c ON t.category_id = c.id
      LEFT JOIN habit_history hh ON t.id = hh.task_id 
        AND hh.date >= $1 
        AND hh.date <= $2
      WHERE t.is_habit = true
      GROUP BY t.id, t.title, t.category_id, c.name
      ORDER BY completion_rate DESC NULLS LAST`
    );
    
    // Calculate overall statistics
    const totalHabits = result.rows.length;
    const activeHabits = result.rows.filter(row => row.total_entries > 0).length;
    const averageCompletionRate = result.rows.length > 0 
      ? Math.round(result.rows.reduce((sum, row) => sum + (row.completion_rate || 0), 0) / result.rows.length)
      : 0;
    
    res.json({
      success: true,
      data: {
        period: `${days} days`,
        totalHabits,
        activeHabits,
        averageCompletionRate: `${averageCompletionRate}%`,
        habits: result.rows
      }
    });
    
  } catch (error) {
    console.error('Error fetching habits overview:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch habits overview',
      message: error.message
    });
  }
});

export default router;
