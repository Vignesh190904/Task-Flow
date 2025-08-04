import { useState } from 'react';
import { format } from 'date-fns';
import { Check, Clock, Star, Edit, Trash2, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Task } from '@/lib/supabase';

interface TaskCardProps {
  task: Task;
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onRestore: (id: string) => void;
  onEdit: (task: Task) => void;
  isAnimating?: boolean;
}

const priorityConfig = {
  low: { 
    color: 'success', 
    icon: '🟢', 
    label: 'Low',
    badgeStyle: 'bg-success-soft border-success text-success'
  },
  medium: { 
    color: 'warning', 
    icon: '🟡', 
    label: 'Medium',
    badgeStyle: 'bg-warning-soft border-warning text-warning'
  },
  high: { 
    color: 'destructive', 
    icon: '🔴', 
    label: 'High',
    badgeStyle: 'bg-destructive-soft border-destructive text-destructive'
  }
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
        // TaskCard base styles - Updated to match TaskFlow theme
        "group relative bg-card border border-border rounded-lg p-5 transition-all duration-200",
        "hover:shadow-medium hover:border-primary hover:-translate-y-1",
        "animate-fade-in",
        isCompleting && "animate-task-complete",
        // Completed state styling - Updated with new green tint
        isCompleted && [
          "bg-success-soft",
          "border-success",
          "shadow-soft"
        ],
        // Deleted state styling
        isDeleted && [
          "opacity-60",
          "bg-muted",
          "border-border"
        ],
        isAnimating && "animate-scale-in"
      )}
    >
      {/* Priority indicator dot - Top right corner */}
      <div className={cn(
        "absolute -top-1 -right-1 w-3 h-3 rounded-full shadow-soft",
        task.priority === 'high' && "bg-priority-high",
        task.priority === 'medium' && "bg-priority-medium", 
        task.priority === 'low' && "bg-priority-low"
      )} />
      
      <div className="flex items-start gap-3">
        {/* Custom completion checkbox */}
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "mt-1 h-6 w-6 p-0 rounded-full transition-all duration-200",
            "border-2 border-border hover:border-ring",
            isCompleted && "bg-success border-success text-white",
            isDeleted && "opacity-50 cursor-not-allowed"
          )}
          onClick={handleComplete}
          disabled={isDeleted}
        >
          {isCompleted && <Check className="h-3 w-3" />}
        </Button>
        
        <div className="flex-1 min-w-0">
          {/* Task title and description */}
          <div className="mb-2">
            <h3 className={cn(
              "font-semibold text-foreground mb-1",
              isCompleted && "line-through text-muted-foreground"
            )}>
              {task.title}
            </h3>
            {task.description && (
              <p className={cn(
                "text-sm text-muted-foreground line-clamp-2",
                isCompleted && "line-through text-muted-foreground"
              )}>
                {task.description}
              </p>
            )}
          </div>
          
          {/* Task metadata */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>Created • {format(new Date(task.created_at), 'MMM d, h:mm a')}</span>
              </div>
              {isCompleted && (
                <div className="flex items-center gap-1 text-success">
                  <Check className="h-3 w-3" />
                  <span>Completed</span>
                </div>
              )}
            </div>
            
            {/* Priority badge */}
            <Badge 
              variant="outline" 
              className={cn(
                "text-xs font-medium",
                task.priority === 'high' && "border-priority-high text-priority-high bg-destructive-soft",
                task.priority === 'medium' && "border-priority-medium text-priority-medium bg-warning-soft",
                task.priority === 'low' && "border-priority-low text-priority-low bg-success-soft"
              )}
            >
              {priority.label}
            </Badge>
          </div>
        </div>
        
        {/* Action buttons */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
          {!isDeleted ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(task)}
                className="h-8 w-8 p-0 hover:bg-muted hover:text-primary transition-all duration-200"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(task.id)}
                className="h-8 w-8 p-0 hover:bg-destructive-soft hover:text-destructive transition-all duration-200"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRestore(task.id)}
              className="h-8 w-8 p-0 hover:bg-primary-soft hover:text-primary transition-all duration-200"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}