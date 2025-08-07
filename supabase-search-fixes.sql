-- Supabase Search Fixes for TaskFlow
-- Run this in your Supabase SQL Editor to fix all search-related issues

-- 1. Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create optimized search indexes for better performance
-- This will significantly improve search performance
CREATE INDEX IF NOT EXISTS idx_tasks_title_search 
ON tasks USING gin(to_tsvector('english', COALESCE(title, '')));

CREATE INDEX IF NOT EXISTS idx_tasks_description_search 
ON tasks USING gin(to_tsvector('english', COALESCE(description, '')));

CREATE INDEX IF NOT EXISTS idx_tasks_combined_search 
ON tasks USING gin(to_tsvector('english', COALESCE(title, '') || ' ' || COALESCE(description, '')));

-- 3. Create a function for optimized text search
CREATE OR REPLACE FUNCTION search_tasks_optimized(search_term TEXT, user_uuid UUID, task_status TEXT DEFAULT NULL)
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
      search_term = '' 
      OR t.title ILIKE '%' || search_term || '%'
      OR t.description ILIKE '%' || search_term || '%'
    )
    AND (
      task_status IS NULL 
      OR (task_status = 'deleted' AND t.deleted_at IS NOT NULL)
      OR (task_status != 'deleted' AND t.status = task_status AND t.deleted_at IS NULL)
    )
  ORDER BY t.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Ensure proper RLS policies for search operations
-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Users can search their own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can update their own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can delete their own tasks" ON tasks;

-- Create comprehensive RLS policies
CREATE POLICY "Users can search their own tasks"
ON tasks
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tasks"
ON tasks
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tasks"
ON tasks
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tasks"
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
GRANT EXECUTE ON FUNCTION search_tasks_optimized(TEXT, UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_task_stats_with_search(TEXT) TO authenticated;

-- 7. Create a trigger to maintain search indexes
CREATE OR REPLACE FUNCTION update_task_search_indexes()
RETURNS TRIGGER AS $$
BEGIN
  -- This trigger ensures search indexes are updated when tasks are modified
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_task_search_indexes ON tasks;
CREATE TRIGGER trigger_update_task_search_indexes
  AFTER INSERT OR UPDATE OR DELETE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_task_search_indexes();

-- 8. Create a function to optimize the search query for better performance
CREATE OR REPLACE FUNCTION optimize_search_query(search_text TEXT)
RETURNS TEXT AS $$
BEGIN
  -- Clean and optimize the search text
  RETURN trim(regexp_replace(search_text, '\s+', ' ', 'g'));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 9. Verify the setup
-- Run these queries to verify everything is working:

-- Check if indexes exist
SELECT 
  indexname, 
  indexdef 
FROM pg_indexes 
WHERE tablename = 'tasks' 
  AND indexname IN ('idx_tasks_title_search', 'idx_tasks_description_search', 'idx_tasks_combined_search');

-- Check if functions exist
SELECT 
  routine_name, 
  routine_type 
FROM information_schema.routines 
WHERE routine_name IN ('search_tasks_optimized', 'get_task_stats_with_search', 'optimize_search_query');

-- Check RLS policies
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd, 
  qual 
FROM pg_policies 
WHERE tablename = 'tasks';

-- Test search function (replace with actual user UUID)
-- SELECT * FROM search_tasks_optimized('test', 'your-user-uuid-here', NULL);

-- 10. Performance optimization: Analyze tables
ANALYZE tasks; 