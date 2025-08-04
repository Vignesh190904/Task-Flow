# TaskFlow Troubleshooting Guide

This guide helps you resolve common issues when setting up and running TaskFlow.

## 🔐 Authentication Issues

### Login Not Working After Registration

**Problem**: You can register but can't log in after email verification.

**Solution**:
1. Check your Supabase project settings:
   - Go to Authentication > Settings
   - Ensure "Enable email confirmations" is ON
   - Check "Confirm email change" is enabled

2. Verify email verification:
   - Check your email for verification link
   - Click the link to confirm your account
   - Try logging in again

3. Check browser console for errors:
   - Open Developer Tools (F12)
   - Look for authentication errors
   - Check Network tab for failed requests

### "User profile not found" Error

**Problem**: Login fails with "User profile not found" error.

**Solution**:
1. Run the updated SQL setup:
   ```sql
   -- Drop existing tables if they exist
   DROP TABLE IF EXISTS tasks;
   DROP TABLE IF EXISTS profiles;
   
   -- Run the complete supabase-setup.sql
   ```

2. Check RLS policies are enabled:
   ```sql
   -- Verify RLS is enabled
   SELECT schemaname, tablename, rowsecurity 
   FROM pg_tables 
   WHERE tablename IN ('profiles', 'tasks');
   ```

3. Test profile creation manually:
   ```sql
   -- Insert a test profile
   INSERT INTO profiles (id, full_name, email, avatar_url)
   VALUES ('your-user-id', 'Test User', 'test@example.com', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix');
   ```

## 🗄️ Database Issues

### Tables Not Created

**Problem**: Running the SQL setup doesn't create tables.

**Solution**:
1. Check you're in the right database:
   ```sql
   SELECT current_database();
   ```

2. Run SQL in correct order:
   ```sql
   -- Enable extensions first
   CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
   
   -- Then create tables
   CREATE TABLE IF NOT EXISTS profiles (...);
   CREATE TABLE IF NOT EXISTS tasks (...);
   
   -- Finally enable RLS
   ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
   ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
   ```

3. Check for syntax errors in SQL editor

### RLS Policy Errors

**Problem**: "Row Level Security" errors when accessing data.

**Solution**:
1. Verify policies are created:
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'profiles';
   SELECT * FROM pg_policies WHERE tablename = 'tasks';
   ```

2. Recreate policies if missing:
   ```sql
   -- Profiles policies
   CREATE POLICY "Users can view own profile" ON profiles
     FOR SELECT USING (auth.uid() = id);
   
   CREATE POLICY "Users can update own profile" ON profiles
     FOR UPDATE USING (auth.uid() = id);
   
   CREATE POLICY "Users can insert own profile" ON profiles
     FOR INSERT WITH CHECK (auth.uid() = id);
   
   -- Tasks policies
   CREATE POLICY "Users can view own tasks" ON tasks
     FOR SELECT USING (auth.uid() = user_id);
   
   CREATE POLICY "Users can insert own tasks" ON tasks
     FOR INSERT WITH CHECK (auth.uid() = user_id);
   
   CREATE POLICY "Users can update own tasks" ON tasks
     FOR UPDATE USING (auth.uid() = user_id);
   
   CREATE POLICY "Users can delete own tasks" ON tasks
     FOR DELETE USING (auth.uid() = user_id);
   ```

## 🌐 Configuration Issues

### Supabase Connection Errors

**Problem**: "Failed to fetch" or connection errors.

**Solution**:
1. Verify Supabase credentials in `client/src/lib/supabase.ts`:
   ```typescript
   const supabaseUrl = 'https://your-project-id.supabase.co'
   const supabaseAnonKey = 'your-anon-key'
   ```

2. Check project status in Supabase dashboard

3. Verify CORS settings in Supabase:
   - Go to Settings > API
   - Add `http://localhost:5173` to allowed origins

### Environment Variables

**Problem**: Server won't start or missing configuration.

**Solution**:
1. Create `.env` file in server directory:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/taskflow
   JWT_SECRET=your-secret-key
   NODE_ENV=development
   ```

2. Restart the server after adding environment variables

## 🚀 Development Issues

### Build Errors

**Problem**: `npm run build` fails.

**Solution**:
1. Clear cache and reinstall:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

2. Check TypeScript errors:
   ```bash
   npx tsc --noEmit
   ```

3. Update dependencies:
   ```bash
   npm update
   ```

### Port Conflicts

**Problem**: "Port already in use" errors.

**Solution**:
1. Find and kill processes using the port:
   ```bash
   # For port 5173 (Vite)
   lsof -ti:5173 | xargs kill -9
   
   # For port 5000 (Express)
   lsof -ti:5000 | xargs kill -9
   ```

2. Use different ports:
   ```bash
   # Frontend
   npm run dev -- --port 3000
   
   # Backend
   PORT=5001 npm run dev
   ```

## 🔧 Debug Mode

Enable detailed logging:

1. **Frontend Debug**:
   ```typescript
   // Add to any component
   console.log('Debug info:', data);
   ```

2. **Backend Debug**:
   ```javascript
   // Add to server.js
   console.log('Request:', req.method, req.url);
   ```

3. **Supabase Debug**:
   ```typescript
   // Enable Supabase debug mode
   const supabase = createClient(url, key, {
     auth: {
       debug: true
     }
   });
   ```

## 📱 Common UI Issues

### Theme Not Applied

**Problem**: TaskFlow theme not showing correctly.

**Solution**:
1. Check CSS imports in `client/src/index.css`
2. Verify Tailwind config in `client/tailwind.config.ts`
3. Clear browser cache and hard refresh (Ctrl+F5)

### Responsive Issues

**Problem**: Layout breaks on mobile.

**Solution**:
1. Check viewport meta tag in `client/index.html`
2. Verify responsive classes in components
3. Test in different screen sizes

## 🆘 Getting Help

If you're still having issues:

1. **Check the logs**:
   - Browser console (F12)
   - Terminal output
   - Supabase logs

2. **Verify setup**:
   - Run `node setup.js` again
   - Check all dependencies are installed
   - Verify Supabase project is active

3. **Common fixes**:
   - Clear browser cache
   - Restart development server
   - Check internet connection
   - Verify Supabase project status

## 📞 Support

For additional help:
- Check the main README.md
- Review Supabase documentation
- Check browser console for specific error messages
- Verify all setup steps are completed

---

**Remember**: Most issues are configuration-related. Double-check your Supabase setup and environment variables! 