import { supabase } from './supabase'
import { Task, TaskInput } from './supabase'

export interface TaskFilters {
  status?: 'pending' | 'completed' | 'deleted' | 'all'
  search?: string
  includeDeleted?: boolean
}

export class TaskService {
  // Get tasks with filters
  static async getTasks(filters: TaskFilters = {}): Promise<Task[]> {
    try {
      let query = supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false })

      // Apply status filter
      if (filters.status && filters.status !== 'all') {
        query = query.eq('status', filters.status)
      }

      // Apply search filter - search in both title and description
      if (filters.search && filters.search.trim()) {
        const searchTerm = filters.search.trim()
        // Use OR condition to search in both title and description
        query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
      }

      // Handle deleted tasks - show only deleted tasks when status is 'deleted'
      if (filters.status === 'deleted') {
        query = query.not('deleted_at', 'is', null)
      } else {
        // For non-deleted tasks, exclude deleted ones
        query = query.is('deleted_at', null)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching tasks:', error)
        throw new Error('Failed to fetch tasks')
      }

      return data || []
    } catch (error) {
      console.error('TaskService.getTasks error:', error)
      // Return empty array instead of throwing to prevent UI freezing
      return []
    }
  }

  // Create a new task
  static async createTask(taskData: TaskInput): Promise<Task> {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error('User not authenticated')
    }

    const { data, error } = await supabase
      .from('tasks')
      .insert({
        user_id: user.id,
        title: taskData.title,
        description: taskData.description,
        priority: taskData.priority,
        due_date: taskData.due_date,
        due_time: taskData.due_time,
        status: 'pending'
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating task:', error)
      throw new Error('Failed to create task')
    }

    return data
  }

  // Update a task
  static async updateTask(taskId: string, updates: Partial<TaskInput>): Promise<Task> {
    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', taskId)
      .select()
      .single()

    if (error) {
      console.error('Error updating task:', error)
      throw new Error('Failed to update task')
    }

    return data
  }

  // Mark task as completed
  static async completeTask(taskId: string): Promise<void> {
    const { error } = await supabase
      .from('tasks')
      .update({ status: 'completed' })
      .eq('id', taskId)

    if (error) {
      console.error('Error completing task:', error)
      throw new Error('Failed to complete task')
    }
  }

  // Mark task as pending
  static async markAsPending(taskId: string): Promise<void> {
    const { error } = await supabase
      .rpc('mark_task_as_pending', { task_id: taskId })

    if (error) {
      console.error('Error marking task as pending:', error)
      throw new Error('Failed to mark task as pending')
    }
  }

  // Soft delete a task
  static async deleteTask(taskId: string): Promise<void> {
    const { error } = await supabase
      .rpc('soft_delete_task', { task_id: taskId })

    if (error) {
      console.error('Error deleting task:', error)
      throw new Error('Failed to delete task')
    }
  }

  // Restore a deleted task
  static async restoreTask(taskId: string): Promise<void> {
    const { error } = await supabase
      .rpc('restore_task', { task_id: taskId })

    if (error) {
      console.error('Error restoring task:', error)
      throw new Error('Failed to restore task')
    }
  }

  // Permanently delete a task
  static async permanentlyDeleteTask(taskId: string): Promise<void> {
    const { error } = await supabase
      .rpc('permanently_delete_task', { task_id: taskId })

    if (error) {
      console.error('Error permanently deleting task:', error)
      throw new Error('Failed to permanently delete task')
    }
  }

  // Get task statistics
  static async getTaskStats(): Promise<{
    total: number
    pending: number
    completed: number
    deleted: number
  }> {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('status, deleted_at')

      if (error) {
        console.error('Error fetching task stats:', error)
        throw new Error('Failed to fetch task statistics')
      }

      const tasks = data || []
      const stats = {
        total: tasks.filter(task => !task.deleted_at).length,
        pending: tasks.filter(task => task.status === 'pending' && !task.deleted_at).length,
        completed: tasks.filter(task => task.status === 'completed' && !task.deleted_at).length,
        deleted: tasks.filter(task => task.deleted_at).length
      }

      return stats
    } catch (error) {
      console.error('TaskService.getTaskStats error:', error)
      // Return default stats instead of throwing to prevent UI freezing
      return {
        total: 0,
        pending: 0,
        completed: 0,
        deleted: 0
      }
    }
  }
} 