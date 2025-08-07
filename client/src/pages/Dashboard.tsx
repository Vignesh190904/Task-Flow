import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from '@/hooks/use-toast';
import { Loader2, Plus, Trash2, CheckSquare, Square, Calendar } from 'lucide-react';
import { Sidebar, TaskFilter } from '@/components/Sidebar';
import TaskCard from '@/components/TaskCard';
import TaskForm from '@/components/TaskForm';
import { TaskService, TaskFilters } from '@/lib/tasks';
import { Task } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentFilter, setCurrentFilter] = useState<TaskFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskCounts, setTaskCounts] = useState({
    all: 0,
    pending: 0,
    completed: 0,
    deleted: 0
  });
  const [searchLoading, setSearchLoading] = useState(false);

  // Memoize the loadTasks function to prevent unnecessary re-renders
  const loadTasks = useCallback(async () => {
    try {
      setLoading(true);
      setSearchLoading(true);
      const filters: TaskFilters = {};
      
      if (currentFilter !== 'all') {
        filters.status = currentFilter;
      }
      
      if (searchQuery) {
        filters.search = searchQuery;
      }

      const fetchedTasks = await TaskService.getTasks(filters);
      setTasks(fetchedTasks);
    } catch (error) {
      console.error('Error loading tasks:', error);
      setError('Failed to load tasks');
      toast({
        title: "Error",
        description: "Failed to load tasks. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setSearchLoading(false);
    }
  }, [currentFilter, searchQuery]);

  // Memoize the loadTaskStats function
  const loadTaskStats = useCallback(async () => {
    try {
      const stats = await TaskService.getTaskStats();
      setTaskCounts(stats);
    } catch (error) {
      console.error('Error loading task stats:', error);
    }
  }, []);

  // Load tasks and stats when filter or search changes - but prevent infinite loops
  useEffect(() => {
    const timer = setTimeout(() => {
      loadTasks();
      loadTaskStats();
    }, 100); // Small delay to prevent rapid successive calls

    return () => clearTimeout(timer);
  }, [currentFilter, searchQuery]); // Only depend on the actual values, not the functions

  // Memoize the filter change handler
  const handleFilterChange = useCallback((filter: TaskFilter) => {
    setCurrentFilter(filter);
  }, []);

  // Memoize the search change handler to prevent focus loss
  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  // Memoize the add task handler
  const handleAddTask = useCallback(() => {
    setEditingTask(null);
    setShowTaskForm(true);
  }, []);

  // Memoize the task created handler
  const handleTaskCreated = useCallback(() => {
    loadTasks();
    loadTaskStats();
  }, [loadTasks, loadTaskStats]);

  // Memoize the edit task handler
  const handleEditTask = useCallback((task: Task) => {
    setEditingTask(task);
    setShowTaskForm(true);
  }, []);

  // Memoize the task updated handler
  const handleTaskUpdated = useCallback(() => {
    loadTasks();
    loadTaskStats();
  }, [loadTasks, loadTaskStats]);

  const getFilterTitle = () => {
    switch (currentFilter) {
      case 'all':
        return 'All Tasks';
      case 'pending':
        return 'Pending Tasks';
      case 'completed':
        return 'Completed Tasks';
      case 'deleted':
        return 'Deleted Tasks';
      default:
        return 'Tasks';
    }
  };

  const getEmptyStateMessage = () => {
    if (searchQuery) {
      return 'No tasks match your search.';
    }
    
    switch (currentFilter) {
      case 'all':
        return 'No tasks yet. Create your first task to get started!';
      case 'pending':
        return 'No pending tasks. Great job staying on top of things!';
      case 'completed':
        return 'No completed tasks yet. Start completing tasks to see them here!';
      case 'deleted':
        return 'No deleted tasks. Deleted tasks will appear here.';
      default:
        return 'No tasks found.';
    }
  };

  const getEmptyStateIcon = () => {
    switch (currentFilter) {
      case 'pending':
        return <Square className="w-12 h-12 text-muted-foreground" />;
      case 'completed':
        return <CheckSquare className="w-12 h-12 text-muted-foreground" />;
      case 'deleted':
        return <Trash2 className="w-12 h-12 text-muted-foreground" />;
      default:
        return <Calendar className="w-12 h-12 text-muted-foreground" />;
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">Please sign in to access your dashboard.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <Sidebar
        currentFilter={currentFilter}
        onFilterChange={handleFilterChange}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        onAddTask={handleAddTask}
        taskCounts={taskCounts}
        isSearchLoading={searchLoading}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-border bg-card">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">{getFilterTitle()}</h1>
              <p className="text-muted-foreground">
                {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'} found
                {searchQuery && ` for "${searchQuery}"`}
              </p>
            </div>
            <Button
              onClick={handleAddTask}
              className="bg-gradient-primary hover:opacity-90 text-white shadow-medium rounded-lg font-medium transition-all duration-200"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
                <p className="text-muted-foreground">Loading tasks...</p>
              </div>
            </div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-12">
              {getEmptyStateIcon()}
              <h3 className="text-lg font-medium text-foreground mt-4 mb-2">No tasks found</h3>
              <p className="text-muted-foreground mb-6">{getEmptyStateMessage()}</p>
              {currentFilter !== 'deleted' && (
                <Button
                  onClick={handleAddTask}
                  className="bg-gradient-primary hover:opacity-90 text-white shadow-medium rounded-lg font-medium transition-all duration-200"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Task
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onTaskUpdated={handleTaskUpdated}
                  onEditTask={handleEditTask}
                  showActions={currentFilter !== 'deleted'}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Task Form Modal */}
      <TaskForm
        isOpen={showTaskForm}
        onClose={() => {
          setShowTaskForm(false);
          setEditingTask(null);
        }}
        onTaskCreated={handleTaskCreated}
        editingTask={editingTask}
      />
    </div>
  );
};

export default Dashboard; 