import { useMemo } from 'react';
import { TaskCard, Task } from './TaskCard';
import { TaskFilter } from './Sidebar';
import { cn } from '@/lib/utils';

interface TaskListProps {
  tasks: Task[];
  filter: TaskFilter;
  searchQuery: string;
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onRestore: (id: string) => void;
  onEdit: (task: Task) => void;
}

export function TaskList({ 
  tasks, 
  filter, 
  searchQuery, 
  onComplete, 
  onDelete, 
  onRestore, 
  onEdit 
}: TaskListProps) {
  const filteredTasks = useMemo(() => {
    let filtered = tasks;

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(task => 
        task.title.toLowerCase().includes(query) ||
        task.description?.toLowerCase().includes(query)
      );
    }

    // Sort tasks
    return filtered.sort((a, b) => {
      // Priority sort for pending tasks
      if (!a.is_completed && !b.is_completed && !a.is_deleted && !b.is_deleted) {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        }
      }
      
      // Then by creation date (newest first)
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [tasks, filter, searchQuery]);

  const getEmptyStateMessage = () => {
    if (searchQuery.trim()) {
      return {
        title: "No tasks found",
        description: `No tasks match "${searchQuery}". Try adjusting your search.`
      };
    }

    const messages = {
      all: {
        title: "No tasks yet",
        description: "Create your first task to get started on your productivity journey!"
      },
      pending: {
        title: "All caught up!",
        description: "No pending tasks. Time to add some new goals or take a well-deserved break!"
      },
      completed: {
        title: "No completed tasks",
        description: "Complete some tasks to see your achievements here."
      },
      deleted: {
        title: "Trash is empty",
        description: "No deleted tasks to restore."
      }
    };

    return messages[filter];
  };

  if (filteredTasks.length === 0) {
    const emptyState = getEmptyStateMessage();
    
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-md space-y-4 animate-fade-in">
          <div className="w-16 h-16 mx-auto bg-gradient-primary rounded-lg flex items-center justify-center shadow-medium">
            <span className="text-2xl">✨</span>
          </div>
          <h3 className="text-xl font-semibold text-foreground">{emptyState.title}</h3>
          <p className="text-muted-foreground">{emptyState.description}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 overflow-y-auto bg-background">
      <div className="max-w-4xl mx-auto space-y-4">
        {/* Results header */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground capitalize">
            {filter === 'all' ? 'All Tasks' : `${filter} Tasks`}
            {searchQuery && (
              <span className="text-muted-foreground font-normal">
                {' '}for "{searchQuery}"
              </span>
            )}
          </h2>
          <span className="text-sm text-muted-foreground">
            {filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'}
          </span>
        </div>

        {/* Task grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredTasks.map((task, index) => (
            <TaskCard
              key={task.id}
              task={task}
              onComplete={onComplete}
              onDelete={onDelete}
              onRestore={onRestore}
              onEdit={onEdit}
              isAnimating={index < 6} // Animate first 6 tasks for better performance
            />
          ))}
        </div>
      </div>
    </div>
  );
}