-- TaskFlow Setup Verification
-- Run this after the main setup to verify everything is working correctly

-- Check if tables exist
SELECT 
  table_name,
  CASE 
    WHEN table_name IS NOT NULL THEN '✅ EXISTS'
    ELSE '❌ MISSING'
  END as status
FROM information_schema.tables 
WHERE table_name IN ('profiles', 'tasks')
AND table_schema = 'public';

-- Check profiles table structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  CASE 
    WHEN column_name IN ('id', 'full_name', 'email', 'avatar_url', 'created_at') THEN '✅ REQUIRED'
    ELSE '⚠️ EXTRA'
  END as required
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check tasks table structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  CASE 
    WHEN column_name IN ('id', 'user_id', 'title', 'description', 'priority', 'status', 'created_at') THEN '✅ REQUIRED'
    ELSE '⚠️ EXTRA'
  END as required
FROM information_schema.columns 
WHERE table_name = 'tasks' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check if RLS is enabled
SELECT 
  schemaname,
  tablename,
  rowsecurity,
  CASE 
    WHEN rowsecurity = true THEN '✅ ENABLED'
    ELSE '❌ DISABLED'
  END as rls_status
FROM pg_tables 
WHERE tablename IN ('profiles', 'tasks')
AND schemaname = 'public';

-- Check RLS policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename IN ('profiles', 'tasks')
AND schemaname = 'public'
ORDER BY tablename, policyname;

-- Check if trigger exists
SELECT 
  trigger_name,
  event_manipulation,
  action_statement,
  CASE 
    WHEN trigger_name IS NOT NULL THEN '✅ EXISTS'
    ELSE '❌ MISSING'
  END as status
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created'
AND event_object_table = 'users'
AND event_object_schema = 'auth';

-- Check if function exists
SELECT 
  routine_name,
  routine_type,
  CASE 
    WHEN routine_name IS NOT NULL THEN '✅ EXISTS'
    ELSE '❌ MISSING'
  END as status
FROM information_schema.routines 
WHERE routine_name = 'handle_new_user'
AND routine_schema = 'public';

-- Summary
SELECT 'TaskFlow Database Verification Complete' as message; 