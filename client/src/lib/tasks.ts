import { supabase } from './supabase'
import { toast } from '@/hooks/use-toast'
import { Task, TaskInput } from './supabase'

export class TaskService {
  static async getTasks(userId: string): Promise<Task[]> {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching tasks:', error)
      throw error
    }
  }

  static async getTasksByStatus(userId: string, status: 'all' | 'pending' | 'completed' | 'deleted'): Promise<Task[]> {
    try {
      let query = supabase
        .from('tasks')
        .select('*')
        .eq('user_id', userId)

      if (status !== 'all') {
        query = query.eq('status', status)
      }

      const { data, error } = await query.order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching tasks by status:', error)
      throw error
    }
  }

  static async createTask(userId: string, taskData: TaskInput): Promise<{ success: boolean; task?: Task; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          user_id: userId,
          title: taskData.title,
          description: taskData.description,
          priority: taskData.priority,
          status: 'pending'
        })
        .select()
        .single()

      if (error) throw error

      toast({
        title: "Task created",
        description: "Your task has been created successfully.",
      })

      return { success: true, task: data }
    } catch (error) {
      console.error('Error creating task:', error)
      return { success: false, error: 'Failed to create task' }
    }
  }

  static async updateTask(taskId: string, updates: Partial<TaskInput>): Promise<{ success: boolean; task?: Task; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', taskId)
        .select()
        .single()

      if (error) throw error

      toast({
        title: "Task updated",
        description: "Your task has been updated successfully.",
      })

      return { success: true, task: data }
    } catch (error) {
      console.error('Error updating task:', error)
      return { success: false, error: 'Failed to update task' }
    }
  }

  static async completeTask(taskId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ status: 'completed' })
        .eq('id', taskId)

      if (error) throw error

      toast({
        title: "Task completed",
        description: "Task marked as completed.",
      })

      return { success: true }
    } catch (error) {
      console.error('Error completing task:', error)
      return { success: false, error: 'Failed to complete task' }
    }
  }

  static async uncompleteTask(taskId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ status: 'pending' })
        .eq('id', taskId)

      if (error) throw error

      toast({
        title: "Task uncompleted",
        description: "Task moved back to pending.",
      })

      return { success: true }
    } catch (error) {
      console.error('Error uncompleting task:', error)
      return { success: false, error: 'Failed to uncomplete task' }
    }
  }

  static async deleteTask(taskId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ status: 'deleted' })
        .eq('id', taskId)

      if (error) throw error

      toast({
        title: "Task deleted",
        description: "Task moved to deleted section.",
      })

      return { success: true }
    } catch (error) {
      console.error('Error deleting task:', error)
      return { success: false, error: 'Failed to delete task' }
    }
  }

  static async restoreTask(taskId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ status: 'pending' })
        .eq('id', taskId)

      if (error) throw error

      toast({
        title: "Task restored",
        description: "Task has been restored to pending.",
      })

      return { success: true }
    } catch (error) {
      console.error('Error restoring task:', error)
      return { success: false, error: 'Failed to restore task' }
    }
  }

  static async permanentlyDeleteTask(taskId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId)

      if (error) throw error

      toast({
        title: "Task permanently deleted",
        description: "Task has been permanently removed.",
      })

      return { success: true }
    } catch (error) {
      console.error('Error permanently deleting task:', error)
      return { success: false, error: 'Failed to permanently delete task' }
    }
  }

  static async getTaskStats(userId: string): Promise<{ total: number; pending: number; completed: number; deleted: number }> {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('status')
        .eq('user_id', userId)

      if (error) throw error

      const stats = {
        total: data?.length || 0,
        pending: data?.filter(t => t.status === 'pending').length || 0,
        completed: data?.filter(t => t.status === 'completed').length || 0,
        deleted: data?.filter(t => t.status === 'deleted').length || 0,
      }

      return stats
    } catch (error) {
      console.error('Error fetching task stats:', error)
      return { total: 0, pending: 0, completed: 0, deleted: 0 }
    }
  }

  static async searchTasks(userId: string, query: string): Promise<Task[]> {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', userId)
        .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error searching tasks:', error)
      return []
    }
  }
} 