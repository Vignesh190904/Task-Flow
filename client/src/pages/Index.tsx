import { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { Sidebar, TaskFilter } from '@/components/Sidebar';
import { TaskList } from '@/components/TaskList';
import { TaskForm } from '@/components/TaskForm';
import { Task } from '@/components/TaskCard';

// Generate unique IDs for tasks
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Sample data for demonstration
const sampleTasks: Task[] = [
  {
    id: '1',
    title: 'Design the perfect user interface',
    description: 'Create mockups and wireframes for the new dashboard layout with modern aesthetics.',
    priority: 'high',
    status: 'pending',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
  },
  {
    id: '2',
    title: 'Review project documentation',
    description: 'Go through all the technical specs and update any outdated information.',
    priority: 'medium',
    status: 'pending',
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
  },
  {
    id: '3',
    title: 'Setup development environment',
    description: 'Install all necessary tools and configure the workspace for optimal productivity.',
    priority: 'high',
    status: 'completed',
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
    completedAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
  },
];

const Index = () => {
  const [tasks, setTasks] = useState<Task[]>(sampleTasks);
  const [currentFilter, setCurrentFilter] = useState<TaskFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>();

  // Calculate task counts for sidebar
  const taskCounts = {
    all: tasks.filter(t => t.status !== 'deleted').length,
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

  const handleSubmitTask = (taskData: Omit<Task, 'id' | 'status' | 'createdAt' | 'completedAt'>) => {
    if (editingTask) {
      // Update existing task
      setTasks(prev => prev.map(task => 
        task.id === editingTask.id 
          ? { ...task, ...taskData }
          : task
      ));
      toast({
        title: "Task updated!",
        description: "Your task has been successfully updated.",
      });
    } else {
      // Create new task
      const newTask: Task = {
        ...taskData,
        id: generateId(),
        status: 'pending',
        createdAt: new Date(),
      };
      setTasks(prev => [newTask, ...prev]);
      toast({
        title: "Task created!",
        description: "Your new task has been added to your list.",
      });
    }
    setIsFormOpen(false);
    setEditingTask(undefined);
  };

  const handleCompleteTask = (id: string) => {
    setTasks(prev => prev.map(task => 
      task.id === id 
        ? { 
            ...task, 
            status: task.status === 'completed' ? 'pending' : 'completed',
            completedAt: task.status === 'completed' ? undefined : new Date()
          }
        : task
    ));
    
    const task = tasks.find(t => t.id === id);
    if (task?.status === 'pending') {
      toast({
        title: "🎉 Task completed!",
        description: "Great job! Keep up the momentum!",
      });
    }
  };

  const handleDeleteTask = (id: string) => {
    setTasks(prev => prev.map(task => 
      task.id === id 
        ? { ...task, status: 'deleted' as const }
        : task
    ));
    toast({
      title: "Task moved to trash",
      description: "You can restore it from the deleted tasks section.",
    });
  };

  const handleRestoreTask = (id: string) => {
    setTasks(prev => prev.map(task => 
      task.id === id 
        ? { ...task, status: 'pending' as const }
        : task
    ));
    toast({
      title: "Task restored!",
      description: "Your task has been moved back to pending.",
    });
  };

  return (
    <div className="min-h-screen bg-page flex">
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
  );
};

export default Index;
