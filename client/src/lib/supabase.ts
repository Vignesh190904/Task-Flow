import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vawdncuhvfjfdzxgykhs.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZhd2RuY3VodmZqZmR6eGd5a2hzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxMjEwNjAsImV4cCI6MjA2OTY5NzA2MH0.2kcH_UXuFrlP4JzluKuRKi0K28hArqTvXpGVz7W286A'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Profile {
  id: string
  full_name: string
  email: string
  avatar_url: string
  custom_avatar_url?: string
  created_at: string
}

export interface Task {
  id: string
  user_id: string
  title: string
  description?: string
  priority: 'low' | 'medium' | 'high'
  status: 'pending' | 'completed' | 'deleted'
  due_date?: string
  due_time?: string
  created_at: string
  deleted_at?: string
  restored_at?: string
}

export interface TaskInput {
  title: string
  description?: string
  priority: 'low' | 'medium' | 'high'
  due_date?: string
  due_time?: string
} 