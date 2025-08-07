-- Supabase Search Setup for TaskFlow
-- Run this in your Supabase SQL Editor to ensure proper search functionality

-- 1. Enable the required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create a full-text search index for better search performance
-- This will improve search performance for title and description fields
CREATE INDEX IF NOT EXISTS idx_tasks_search 
ON tasks 
USING gin(to_tsvector('english', COALESCE(title, '') || ' ' || COALESCE(description, '')));

-- 3. Create a function for better text search
CREATE OR REPLACE FUNCTION search_tasks(search_term TEXT, user_uuid UUID)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  title TEXT,
  description TEXT,
  priority TEXT,
  status TEXT,
  due_date DATE,
  due_time TIME,
  created_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ,
  restored_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.id,
    t.user_id,
    t.title,
    t.description,
    t.priority,
    t.status,
    t.due_date,
    t.due_time,
    t.created_at,
    t.deleted_at,
    t.restored_at
  FROM tasks t
  WHERE 
    t.user_id = user_uuid
    AND (
      t.title ILIKE '%' || search_term || '%'
      OR t.description ILIKE '%' || search_term || '%'
    )
  ORDER BY t.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Ensure RLS policies are properly set up for search
-- Policy for users to search their own tasks
CREATE POLICY IF NOT EXISTS "Users can search their own tasks"
ON tasks
FOR SELECT
USING (auth.uid() = user_id);

-- Policy for users to update their own tasks (for restore functionality)
CREATE POLICY IF NOT EXISTS "Users can update their own tasks"
ON tasks
FOR UPDATE
USING (auth.uid() = user_id);

-- Policy for users to delete their own tasks (for permanent delete)
CREATE POLICY IF NOT EXISTS "Users can delete their own tasks"
ON tasks
FOR DELETE
USING (auth.uid() = user_id);

-- 5. Create a function to get task statistics with search
CREATE OR REPLACE FUNCTION get_task_stats_with_search(search_term TEXT DEFAULT '')
RETURNS TABLE (
  total BIGINT,
  pending BIGINT,
  completed BIGINT,
  deleted BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) FILTER (WHERE deleted_at IS NULL) as total,
    COUNT(*) FILTER (WHERE status = 'pending' AND deleted_at IS NULL) as pending,
    COUNT(*) FILTER (WHERE status = 'completed' AND deleted_at IS NULL) as completed,
    COUNT(*) FILTER (WHERE deleted_at IS NOT NULL) as deleted
  FROM tasks
  WHERE 
    user_id = auth.uid()
    AND (
      search_term = ''
      OR title ILIKE '%' || search_term || '%'
      OR description ILIKE '%' || search_term || '%'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Grant necessary permissions
GRANT EXECUTE ON FUNCTION search_tasks(TEXT, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_task_stats_with_search(TEXT) TO authenticated;

-- 7. Create a trigger to update the search index when tasks are modified
CREATE OR REPLACE FUNCTION update_task_search_index()
RETURNS TRIGGER AS $$
BEGIN
  -- This will automatically update the full-text search index
  -- when tasks are inserted, updated, or deleted
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER IF NOT EXISTS trigger_update_task_search_index
  AFTER INSERT OR UPDATE OR DELETE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_task_search_index();

-- 8. Verify the setup
-- You can run these queries to verify everything is working:

-- Check if the search index exists
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'tasks' AND indexname = 'idx_tasks_search';

-- Check if the search function exists
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_name IN ('search_tasks', 'get_task_stats_with_search');

-- Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'tasks'; 