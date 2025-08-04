import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { Sidebar, TaskFilter } from '@/components/Sidebar';
import { TaskList } from '@/components/TaskList';
import { TaskForm } from '@/components/TaskForm';
import { Task } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { LogOut, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { TaskService } from '@/lib/tasks';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentFilter, setCurrentFilter] = useState<TaskFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>();
  const [loading, setLoading] = useState(true);

  // Load tasks on component mount and when filter changes
  useEffect(() => {
    if (user) {
      loadTasks();
    }
  }, [user, currentFilter]);

  const loadTasks = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const tasksData = await TaskService.getTasksByStatus(user.id, currentFilter);
      setTasks(tasksData);
    } catch (error) {
      console.error('Error loading tasks:', error);
      toast({
        title: "Error loading tasks",
        description: "Failed to load your tasks. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    const result = await signOut();
    if (result.success) {
      navigate('/');
    }
  };

  // Calculate task counts for sidebar
  const taskCounts = {
    all: tasks.length,
    pending: tasks.filter(t => t.status === 'pending').length,
    completed: tasks.filter(t => t.status === 'completed').length,
    deleted: tasks.filter(t => t.status === 'deleted').length,
  };

  // Task operations
  const handleAddTask = () => {
    setEditingTask(undefined);
    setIsFormOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsFormOpen(true);
  };

  const handleSubmitTask = async (taskData: { title: string; description?: string; priority: 'low' | 'medium' | 'high' }) => {
    if (!user) return;

    if (editingTask) {
      // Update existing task
      const result = await TaskService.updateTask(editingTask.id, taskData);
      if (result.success) {
        await loadTasks(); // Reload tasks
      }
    } else {
      // Create new task
      const result = await TaskService.createTask(user.id, taskData);
      if (result.success) {
        await loadTasks(); // Reload tasks
      }
    }
    setIsFormOpen(false);
    setEditingTask(undefined);
  };

  const handleCompleteTask = async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    const result = task.status === 'completed'
      ? await TaskService.uncompleteTask(id)
      : await TaskService.completeTask(id);

    if (result.success) {
      await loadTasks(); // Reload tasks
    }
  };

  const handleDeleteTask = async (id: string) => {
    const result = await TaskService.deleteTask(id);
    if (result.success) {
      await loadTasks(); // Reload tasks
    }
  };

  const handleRestoreTask = async (id: string) => {
    const result = await TaskService.restoreTask(id);
    if (result.success) {
      await loadTasks(); // Reload tasks
    }
  };

  if (!user) {
    return null; // Loading state
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Header with user info and logout */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-sm border-b border-border shadow-soft">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center shadow-medium">
              <span className="text-white font-bold text-sm">TF</span>
            </div>
            <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">TaskFlow</span>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3 text-sm text-muted-foreground">
              <img 
                src={user.avatar_url} 
                alt="Avatar" 
                className="w-8 h-8 rounded-full border-2 border-border"
              />
              <span className="font-medium text-foreground">Welcome, {user.full_name}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-muted-foreground hover:text-primary hover:bg-primary-soft transition-all duration-200"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main content with top margin for header */}
      <div className="flex w-full pt-20">
        <Sidebar
          currentFilter={currentFilter}
          onFilterChange={setCurrentFilter}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onAddTask={handleAddTask}
          taskCounts={taskCounts}
        />
        
        <TaskList
          tasks={tasks}
          filter={currentFilter}
          searchQuery={searchQuery}
          onComplete={handleCompleteTask}
          onDelete={handleDeleteTask}
          onRestore={handleRestoreTask}
          onEdit={handleEditTask}
        />

        <TaskForm
          task={editingTask}
          isOpen={isFormOpen}
          onSubmit={handleSubmitTask}
          onCancel={() => {
            setIsFormOpen(false);
            setEditingTask(undefined);
          }}
        />
      </div>
    </div>
  );
};

export default Dashboard; 