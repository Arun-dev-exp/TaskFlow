import express from 'express';
import { pool } from '../db/connection.js';

const router = express.Router();

// GET /api/tasks - Get all tasks with optional filtering
router.get('/', async (req, res) => {
  try {
    const { filter, category, search } = req.query;
    
    let query = `
      SELECT 
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
              'id', tb.id,
              'start_time', tb.start_time,
              'end_time', tb.end_time,
              'date', tb.date
            )
          ) FILTER (WHERE tb.id IS NOT NULL), 
          '[]'::json
        ) as time_blocks,
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
      LEFT JOIN time_blocks tb ON t.id = tb.task_id
      LEFT JOIN habit_history hh ON t.id = hh.task_id
    `;
    
    const whereConditions = [];
    const queryParams = [];
    let paramCount = 0;
    
    // Apply filters
    if (filter === 'active') {
      whereConditions.push(`t.completed = false`);
    } else if (filter === 'completed') {
      whereConditions.push(`t.completed = true`);
    } else if (filter === 'habits') {
      whereConditions.push(`t.is_habit = true`);
    }
    
    if (category && category !== 'all') {
      paramCount++;
      whereConditions.push(`c.name = $${paramCount}`);
      queryParams.push(category);
    }
    
    if (search) {
      paramCount++;
      whereConditions.push(`(t.title ILIKE $${paramCount} OR t.description ILIKE $${paramCount})`);
      queryParams.push(`%${search}%`);
    }
    
    if (whereConditions.length > 0) {
      query += ` WHERE ${whereConditions.join(' AND ')}`;
    }
    
    query += ` GROUP BY t.id, c.id, c.name, c.color, c.text_color ORDER BY t.created_at DESC`;
    
    const result = await pool.query(query, queryParams);
    
    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length
    });
    
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch tasks',
      message: error.message
    });
  }
});

// GET /api/tasks/:id - Get a specific task
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = `
      SELECT 
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
              'id', tb.id,
              'start_time', tb.start_time,
              'end_time', tb.end_time,
              'date', tb.date
            )
          ) FILTER (WHERE tb.id IS NOT NULL), 
          '[]'::json
        ) as time_blocks,
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
      LEFT JOIN time_blocks tb ON t.id = tb.task_id
      LEFT JOIN habit_history hh ON t.id = hh.task_id
      WHERE t.id = $1
      GROUP BY t.id, c.id, c.name, c.color, c.text_color
    `;
    
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }
    
    res.json({
      success: true,
      data: result.rows[0]
    });
    
  } catch (error) {
    console.error('Error fetching task:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch task',
      message: error.message
    });
  }
});

// POST /api/tasks - Create a new task
router.post('/', async (req, res) => {
  try {
    const { title, description, category, isHabit, timeBlock } = req.body;
    
    if (!title) {
      return res.status(400).json({
        success: false,
        error: 'Title is required'
      });
    }
    
    // Get category ID
    let categoryId = null;
    if (category) {
      const categoryResult = await pool.query(
        'SELECT id FROM categories WHERE name = $1',
        [category]
      );
      if (categoryResult.rows.length > 0) {
        categoryId = categoryResult.rows[0].id;
      }
    }
    
    // Insert task
    const taskResult = await pool.query(
      `INSERT INTO tasks (title, description, category_id, is_habit) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
      [title, description, categoryId, isHabit || false]
    );
    
    const task = taskResult.rows[0];
    
    // Insert time block if provided
    if (timeBlock && timeBlock.start && timeBlock.end && timeBlock.date) {
      await pool.query(
        `INSERT INTO time_blocks (task_id, start_time, end_time, date) 
         VALUES ($1, $2, $3, $4)`,
        [task.id, timeBlock.start, timeBlock.end, timeBlock.date]
      );
    }
    
    // Insert initial habit history if it's a habit
    if (isHabit) {
      const today = new Date().toISOString().split('T')[0];
      await pool.query(
        `INSERT INTO habit_history (task_id, date, completed) 
         VALUES ($1, $2, $3)`,
        [task.id, today, false]
      );
    }
    
    // Fetch the complete task with all related data
    const completeTaskResult = await pool.query(
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
              'id', tb.id,
              'start_time', tb.start_time,
              'end_time', tb.end_time,
              'date', tb.date
            )
          ) FILTER (WHERE tb.id IS NOT NULL), 
          '[]'::json
        ) as time_blocks,
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
      LEFT JOIN time_blocks tb ON t.id = tb.task_id
      LEFT JOIN habit_history hh ON t.id = hh.task_id
      WHERE t.id = $1
      GROUP BY t.id, c.id, c.name, c.color, c.text_color`,
      [task.id]
    );
    
    res.status(201).json({
      success: true,
      data: completeTaskResult.rows[0],
      message: 'Task created successfully'
    });
    
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create task',
      message: error.message
    });
  }
});

// PUT /api/tasks/:id - Update a task
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, category, isHabit, timeBlock } = req.body;
    
    // Check if task exists
    const existingTask = await pool.query('SELECT * FROM tasks WHERE id = $1', [id]);
    if (existingTask.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }
    
    // Get category ID
    let categoryId = null;
    if (category) {
      const categoryResult = await pool.query(
        'SELECT id FROM categories WHERE name = $1',
        [category]
      );
      if (categoryResult.rows.length > 0) {
        categoryId = categoryResult.rows[0].id;
      }
    }
    
    // Update task
    const updateResult = await pool.query(
      `UPDATE tasks 
       SET title = COALESCE($1, title), 
           description = COALESCE($2, description), 
           category_id = COALESCE($3, category_id), 
           is_habit = COALESCE($4, is_habit),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $5 
       RETURNING *`,
      [title, description, categoryId, isHabit, id]
    );
    
    // Update time block if provided
    if (timeBlock) {
      // Delete existing time blocks
      await pool.query('DELETE FROM time_blocks WHERE task_id = $1', [id]);
      
      // Insert new time block if provided
      if (timeBlock.start && timeBlock.end && timeBlock.date) {
        await pool.query(
          `INSERT INTO time_blocks (task_id, start_time, end_time, date) 
           VALUES ($1, $2, $3, $4)`,
          [id, timeBlock.start, timeBlock.end, timeBlock.date]
        );
      }
    }
    
    // Fetch the complete updated task
    const completeTaskResult = await pool.query(
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
              'id', tb.id,
              'start_time', tb.start_time,
              'end_time', tb.end_time,
              'date', tb.date
            )
          ) FILTER (WHERE tb.id IS NOT NULL), 
          '[]'::json
        ) as time_blocks,
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
      LEFT JOIN time_blocks tb ON t.id = tb.task_id
      LEFT JOIN habit_history hh ON t.id = hh.task_id
      WHERE t.id = $1
      GROUP BY t.id, c.id, c.name, c.color, c.text_color`,
      [id]
    );
    
    res.json({
      success: true,
      data: completeTaskResult.rows[0],
      message: 'Task updated successfully'
    });
    
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update task',
      message: error.message
    });
  }
});

// PATCH /api/tasks/:id/toggle - Toggle task completion
router.patch('/:id/toggle', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      `UPDATE tasks 
       SET completed = NOT completed, 
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 
       RETURNING *`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }
    
    res.json({
      success: true,
      data: result.rows[0],
      message: 'Task completion toggled successfully'
    });
    
  } catch (error) {
    console.error('Error toggling task:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to toggle task',
      message: error.message
    });
  }
});

// DELETE /api/tasks/:id - Delete a task
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query('DELETE FROM tasks WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Task deleted successfully',
      data: result.rows[0]
    });
    
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete task',
      message: error.message
    });
  }
});

export default router;
