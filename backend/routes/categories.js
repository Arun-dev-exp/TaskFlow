import express from 'express';
import { pool } from '../db/connection.js';

const router = express.Router();

// GET /api/categories - Get all categories
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM categories ORDER BY name ASC'
    );
    
    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length
    });
    
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch categories',
      message: error.message
    });
  }
});

// GET /api/categories/:id - Get a specific category
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'SELECT * FROM categories WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Category not found'
      });
    }
    
    res.json({
      success: true,
      data: result.rows[0]
    });
    
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch category',
      message: error.message
    });
  }
});

// POST /api/categories - Create a new category
router.post('/', async (req, res) => {
  try {
    const { name, color, textColor } = req.body;
    
    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Category name is required'
      });
    }
    
    // Check if category already exists
    const existingCategory = await pool.query(
      'SELECT * FROM categories WHERE name = $1',
      [name]
    );
    
    if (existingCategory.rows.length > 0) {
      return res.status(409).json({
        success: false,
        error: 'Category with this name already exists'
      });
    }
    
    const result = await pool.query(
      `INSERT INTO categories (name, color, text_color) 
       VALUES ($1, $2, $3) 
       RETURNING *`,
      [name, color || 'bg-slate-500', textColor || 'text-slate-500']
    );
    
    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'Category created successfully'
    });
    
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create category',
      message: error.message
    });
  }
});

// PUT /api/categories/:id - Update a category
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, color, textColor } = req.body;
    
    // Check if category exists
    const existingCategory = await pool.query(
      'SELECT * FROM categories WHERE id = $1',
      [id]
    );
    
    if (existingCategory.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Category not found'
      });
    }
    
    // Check if new name conflicts with existing category
    if (name && name !== existingCategory.rows[0].name) {
      const nameConflict = await pool.query(
        'SELECT * FROM categories WHERE name = $1 AND id != $2',
        [name, id]
      );
      
      if (nameConflict.rows.length > 0) {
        return res.status(409).json({
          success: false,
          error: 'Category with this name already exists'
        });
      }
    }
    
    const result = await pool.query(
      `UPDATE categories 
       SET name = COALESCE($1, name), 
           color = COALESCE($2, color), 
           text_color = COALESCE($3, text_color),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $4 
       RETURNING *`,
      [name, color, textColor, id]
    );
    
    res.json({
      success: true,
      data: result.rows[0],
      message: 'Category updated successfully'
    });
    
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update category',
      message: error.message
    });
  }
});

// DELETE /api/categories/:id - Delete a category
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if category is being used by any tasks
    const tasksUsingCategory = await pool.query(
      'SELECT COUNT(*) FROM tasks WHERE category_id = $1',
      [id]
    );
    
    if (parseInt(tasksUsingCategory.rows[0].count) > 0) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete category that is being used by tasks',
        taskCount: parseInt(tasksUsingCategory.rows[0].count)
      });
    }
    
    const result = await pool.query(
      'DELETE FROM categories WHERE id = $1 RETURNING *',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Category not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Category deleted successfully',
      data: result.rows[0]
    });
    
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete category',
      message: error.message
    });
  }
});

// GET /api/categories/:id/tasks - Get all tasks in a category
router.get('/:id/tasks', async (req, res) => {
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
      WHERE t.category_id = $1
      GROUP BY t.id, c.id, c.name, c.color, c.text_color
      ORDER BY t.created_at DESC`,
      [id]
    );
    
    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length
    });
    
  } catch (error) {
    console.error('Error fetching category tasks:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch category tasks',
      message: error.message
    });
  }
});

export default router;
