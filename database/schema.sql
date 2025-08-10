-- TaskFlow Database Schema
-- Run this in your PostgreSQL database

-- Create database (run this first if database doesn't exist)
-- CREATE DATABASE "Task Flow";

-- Connect to the database first, then run the following:

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) NOT NULL UNIQUE,
    color VARCHAR(20) DEFAULT 'bg-slate-500',
    text_color VARCHAR(20) DEFAULT 'text-slate-500',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    completed BOOLEAN DEFAULT FALSE,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    is_habit BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create time_blocks table for time-blocked tasks
CREATE TABLE IF NOT EXISTS time_blocks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create habit_history table for tracking habit completion
CREATE TABLE IF NOT EXISTS habit_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(task_id, date)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tasks_category_id ON tasks(category_id);
CREATE INDEX IF NOT EXISTS idx_tasks_completed ON tasks(completed);
CREATE INDEX IF NOT EXISTS idx_tasks_is_habit ON tasks(is_habit);
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at);
CREATE INDEX IF NOT EXISTS idx_time_blocks_task_id ON time_blocks(task_id);
CREATE INDEX IF NOT EXISTS idx_time_blocks_date ON time_blocks(date);
CREATE INDEX IF NOT EXISTS idx_habit_history_task_id ON habit_history(task_id);
CREATE INDEX IF NOT EXISTS idx_habit_history_date ON habit_history(date);

-- Insert default categories
INSERT INTO categories (name, color, text_color) VALUES
    ('work', 'bg-indigo-500', 'text-indigo-500'),
    ('personal', 'bg-pink-500', 'text-pink-500'),
    ('health', 'bg-emerald-500', 'text-emerald-500'),
    ('learning', 'bg-amber-500', 'text-amber-500'),
    ('other', 'bg-slate-500', 'text-slate-500')
ON CONFLICT (name) DO NOTHING;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_categories_updated_at 
    BEFORE UPDATE ON categories 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at 
    BEFORE UPDATE ON tasks 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_time_blocks_updated_at 
    BEFORE UPDATE ON time_blocks 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_habit_history_updated_at 
    BEFORE UPDATE ON habit_history 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create view for tasks with all related data
CREATE OR REPLACE VIEW tasks_with_details AS
SELECT 
    t.id,
    t.title,
    t.description,
    t.completed,
    t.is_habit,
    t.created_at,
    t.updated_at,
    c.id as category_id,
    c.name as category_name,
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
GROUP BY t.id, c.id, c.name, c.color, c.text_color;

-- Grant permissions (adjust as needed for your setup)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgre;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgre;
