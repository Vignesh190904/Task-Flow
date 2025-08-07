import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { CheckCircle, Circle, Trash2, Edit, RotateCcw, Calendar, Clock } from 'lucide-react';
import { TaskService } from '@/lib/tasks';
import { Task } from '@/lib/supabase';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";

interface TaskCardProps {
  task: Task;
  onTaskUpdated: () => void;
  onEditTask: (task: Task) => void;
  showActions?: boolean;
}

const TaskCard = ({ task, onTaskUpdated, onEditTask, showActions = true }: TaskCardProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleComplete = async () => {
    setIsLoading(true);
    try {
      await TaskService.completeTask(task.id);
      toast({
        title: "Task completed",
        description: "Task marked as completed.",
      });
      onTaskUpdated();
    } catch (error) {
      console.error('Error completing task:', error);
      toast({
        title: "Error",
        description: "Failed to complete task. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsPending = async () => {
    setIsLoading(true);
    try {
      await TaskService.markAsPending(task.id);
      toast({
        title: "Task updated",
        description: "Task marked as pending.",
      });
      onTaskUpdated();
    } catch (error) {
      console.error('Error marking task as pending:', error);
      toast({
        title: "Error",
        description: "Failed to update task. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      await TaskService.deleteTask(task.id);
      toast({
        title: "Task deleted",
        description: "Task moved to deleted section.",
      });
      onTaskUpdated();
    } catch (error) {
      console.error('Error deleting task:', error);
      toast({
        title: "Error",
        description: "Failed to delete task. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setShowDeleteDialog(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const isOverdue = () => {
    if (!task.due_date) return false;
    const dueDate = new Date(task.due_date);
    const now = new Date();
    return dueDate < now && task.status === 'pending';
  };

  return (
    <Card className={`border-border hover:shadow-soft transition-all duration-200 ${
      isOverdue() ? 'border-destructive/50 bg-destructive/5' : ''
    }`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-3">
              {showActions && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={task.status === 'completed' ? handleMarkAsPending : handleComplete}
                  disabled={isLoading}
                  className={`h-6 w-6 p-0 rounded-full transition-all duration-200 ${
                    task.status === 'completed' 
                      ? 'text-success hover:bg-success/10' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {task.status === 'completed' ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <Circle className="h-4 w-4" />
                  )}
                </Button>
              )}

              <div className="flex-1 min-w-0">
                <h3 className={`font-medium text-foreground mb-1 ${
                  task.status === 'completed' ? 'line-through text-muted-foreground' : ''
                }`}>
                  {task.title}
                </h3>
                
                {task.description && (
                  <p className={`text-sm text-muted-foreground mb-2 ${
                    task.status === 'completed' ? 'line-through' : ''
                  }`}>
                    {task.description}
                  </p>
                )}

                {/* Due Date and Time */}
                {(task.due_date || task.due_time) && (
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                    {task.due_date && (
                      <div className={`flex items-center gap-1 ${
                        isOverdue() ? 'text-destructive' : ''
                      }`}>
                        <Calendar className="h-3 w-3" />
                        {formatDate(task.due_date)}
                        {isOverdue() && <span className="text-destructive">(Overdue)</span>}
                      </div>
                    )}
                    {task.due_time && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatTime(task.due_time)}
                      </div>
                    )}
                  </div>
                )}

                {/* Priority Badge */}
                <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mb-2">
                  {task.priority === 'high' && (
                    <span className="bg-destructive/10 text-destructive">High Priority</span>
                  )}
                  {task.priority === 'medium' && (
                    <span className="bg-warning/10 text-warning">Medium Priority</span>
                  )}
                  {task.priority === 'low' && (
                    <span className="bg-success/10 text-success">Low Priority</span>
                  )}
                </div>

                {/* Created Date */}
                <p className="text-xs text-muted-foreground">
                  Created {formatDate(task.created_at)}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {showActions && (
            <div className="flex gap-1 ml-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEditTask(task)}
                disabled={isLoading}
                className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
              >
                <Edit className="h-4 w-4" />
              </Button>
              
              {task.status === 'completed' ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMarkAsPending}
                  disabled={isLoading}
                  className="h-8 w-8 p-0 text-success hover:text-success hover:bg-success/10"
                  title="Mark as Pending"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              ) : (
                <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={isLoading}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                      title="Delete Task"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Task?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this task? You can restore it from the deleted section.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
                        disabled={isLoading}
                      >
                        {isLoading ? "Deleting..." : "Delete"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskCard;