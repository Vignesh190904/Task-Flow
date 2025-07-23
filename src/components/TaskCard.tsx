import { useState } from 'react';
import { format } from 'date-fns';
import { Check, Clock, Star, Edit, Trash2, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'completed' | 'deleted';
  createdAt: Date;
  completedAt?: Date;
  dueDate?: Date;
}

interface TaskCardProps {
  task: Task;
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onRestore: (id: string) => void;
  onEdit: (task: Task) => void;
  isAnimating?: boolean;
}

const priorityConfig = {
  low: { color: 'success', icon: '🟢', label: 'Low' },
  medium: { color: 'warning', icon: '🟡', label: 'Medium' },
  high: { color: 'destructive', icon: '🔴', label: 'High' }
};

export function TaskCard({ task, onComplete, onDelete, onRestore, onEdit, isAnimating }: TaskCardProps) {
  const [isCompleting, setIsCompleting] = useState(false);
  
  const handleComplete = async () => {
    if (task.status === 'completed') return;
    
    setIsCompleting(true);
    setTimeout(() => {
      onComplete(task.id);
      setIsCompleting(false);
    }, 600);
  };

  const priority = priorityConfig[task.priority];
  const isCompleted = task.status === 'completed';
  const isDeleted = task.status === 'deleted';

  return (
    <div
      className={cn(
        "group relative bg-card border border-border-soft rounded-xl p-4 transition-all duration-300",
        "hover:shadow-medium hover:border-border hover:-translate-y-1",
        "animate-fade-in",
        isCompleting && "animate-task-complete",
        isCompleted && "opacity-75 bg-success-soft border-success/20",
        isDeleted && "opacity-60 bg-muted border-muted",
        isAnimating && "animate-scale-in"
      )}
    >
      {/* Priority indicator */}
      <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-gradient-primary shadow-medium" />
      
      <div className="flex items-start gap-3">
        {/* Completion checkbox */}
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "mt-1 h-6 w-6 p-0 rounded-full transition-all duration-300",
            "border-2 border-border-soft hover:border-primary",
            isCompleted && "bg-success border-success text-success-foreground",
            isDeleted && "opacity-50 cursor-not-allowed"
          )}
          onClick={handleComplete}
          disabled={isDeleted || isCompleting}
        >
          {isCompleted && <Check className="h-3 w-3" />}
        </Button>

        <div className="flex-1 min-w-0">
          {/* Task title and description */}
          <div className="space-y-1">
            <h3 className={cn(
              "font-medium leading-tight",
              isCompleted && "line-through text-muted-foreground",
              isDeleted && "line-through text-muted-foreground"
            )}>
              {task.title}
            </h3>
            {task.description && (
              <p className={cn(
                "text-sm text-muted-foreground line-clamp-2",
                isCompleted && "line-through",
                isDeleted && "line-through"
              )}>
                {task.description}
              </p>
            )}
          </div>

          {/* Metadata */}
          <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
            <Badge variant="outline" className={cn(
              "text-xs",
              task.priority === 'high' && "border-priority-high text-priority-high",
              task.priority === 'medium' && "border-priority-medium text-priority-medium",
              task.priority === 'low' && "border-priority-low text-priority-low"
            )}>
              {priority.icon} {priority.label}
            </Badge>
            
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>Created {format(task.createdAt, 'MMM d, h:mm a')}</span>
            </div>
            
            {task.completedAt && (
              <div className="flex items-center gap-1 text-success">
                <Check className="h-3 w-3" />
                <span>Completed {format(task.completedAt, 'MMM d, h:mm a')}</span>
              </div>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className={cn(
          "flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity",
          "md:opacity-100" // Always visible on mobile
        )}>
          {!isDeleted && (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-accent"
                onClick={() => onEdit(task)}
              >
                <Edit className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-destructive-soft hover:text-destructive"
                onClick={() => onDelete(task.id)}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </>
          )}
          
          {isDeleted && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-primary-soft hover:text-primary"
              onClick={() => onRestore(task.id)}
            >
              <RotateCcw className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}