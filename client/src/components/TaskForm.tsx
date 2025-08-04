import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { X } from 'lucide-react';
import { Task } from '@/lib/supabase';

const taskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
});

type TaskFormData = z.infer<typeof taskSchema>;

interface TaskFormProps {
  task?: Task;
  isOpen: boolean;
  onSubmit: (data: { title: string; description?: string; priority: 'low' | 'medium' | 'high' }) => void;
  onCancel: () => void;
}

export function TaskForm({ task, isOpen, onSubmit, onCancel }: TaskFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: '',
      description: '',
      priority: 'medium',
    },
  });

  useEffect(() => {
    if (task) {
      setValue('title', task.title);
      setValue('description', task.description || '');
      setValue('priority', task.priority);
    } else {
      reset();
    }
  }, [task, setValue, reset]);

  const handleFormSubmit = async (data: TaskFormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
      reset();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent className="bg-card border border-border rounded-lg shadow-medium max-w-md">
        <DialogHeader className="border-b border-border pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold text-foreground">
              {task ? 'Edit Task' : 'Add New Task'}
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancel}
              className="h-8 w-8 p-0 hover:bg-muted transition-all duration-200"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-foreground font-medium">Title</Label>
            <Input
              id="title"
              {...register('title')}
              placeholder="Enter task title"
              className="bg-background border-border focus:border-ring rounded-lg transition-all duration-200"
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-foreground font-medium">Description (Optional)</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Enter task description"
              className="bg-background border-border focus:border-ring rounded-lg transition-all duration-200"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority" className="text-foreground font-medium">Priority</Label>
            <Select
              value={task?.priority || 'medium'}
              onValueChange={(value) => setValue('priority', value as 'low' | 'medium' | 'high')}
            >
              <SelectTrigger className="bg-background border-border focus:border-ring rounded-lg transition-all duration-200">
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex-1 border-border hover:bg-muted transition-all duration-200 rounded-lg"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-gradient-primary hover:opacity-90 text-white rounded-lg font-medium transition-all duration-200 shadow-medium"
            >
              {isSubmitting ? 'Saving...' : (task ? 'Update Task' : 'Create Task')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}