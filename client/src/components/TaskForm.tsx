import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { Loader2, Plus } from 'lucide-react';
import { TaskService, TaskInput } from '@/lib/tasks';
import { Task } from '@/lib/supabase';

interface TaskFormProps {
  isOpen: boolean;
  onClose: () => void;
  onTaskCreated: () => void;
  editingTask?: Task | null;
}

const TaskForm = ({ isOpen, onClose, onTaskCreated, editingTask }: TaskFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<TaskInput>({
    title: '',
    description: '',
    priority: 'medium',
    due_date: '',
    due_time: ''
  });

  useEffect(() => {
    if (editingTask) {
      setFormData({
        title: editingTask.title,
        description: editingTask.description || '',
        priority: editingTask.priority,
        due_date: editingTask.due_date || '',
        due_time: editingTask.due_time || ''
      });
    } else {
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        due_date: '',
        due_time: ''
      });
    }
  }, [editingTask, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast({
        title: "Error",
        description: "Task title is required.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      if (editingTask) {
        await TaskService.updateTask(editingTask.id, formData);
        toast({
          title: "Task updated",
          description: "Your task has been updated successfully.",
        });
      } else {
        await TaskService.createTask(formData);
        toast({
          title: "Task created",
          description: "Your task has been created successfully.",
        });
      }

      onTaskCreated();
      onClose();
    } catch (error) {
      console.error('Error saving task:', error);
      toast({
        title: "Error",
        description: "Failed to save task. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof TaskInput, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-primary" />
            {editingTask ? 'Edit Task' : 'Add New Task'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-foreground font-medium">Title *</Label>
            <Input
              id="title"
              type="text"
              placeholder="Enter task title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className="bg-background border-border focus:border-ring transition-all duration-200 rounded-lg"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-foreground font-medium">Description</Label>
            <Textarea
              id="description"
              placeholder="Enter task description (optional)"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="bg-background border-border focus:border-ring transition-all duration-200 rounded-lg min-h-[80px]"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="due_date" className="text-foreground font-medium">Due Date</Label>
              <Input
                id="due_date"
                type="date"
                value={formData.due_date}
                onChange={(e) => handleInputChange('due_date', e.target.value)}
                className="bg-background border-border focus:border-ring transition-all duration-200 rounded-lg"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="due_time" className="text-foreground font-medium">Due Time</Label>
              <Input
                id="due_time"
                type="time"
                value={formData.due_time}
                onChange={(e) => handleInputChange('due_time', e.target.value)}
                className="bg-background border-border focus:border-ring transition-all duration-200 rounded-lg"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority" className="text-foreground font-medium">Priority</Label>
            <Select
              value={formData.priority}
              onValueChange={(value) => handleInputChange('priority', value)}
            >
              <SelectTrigger className="bg-background border-border focus:border-ring transition-all duration-200 rounded-lg">
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
              onClick={onClose}
              className="flex-1"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-primary hover:opacity-90 text-white shadow-medium rounded-lg font-medium transition-all duration-200"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {editingTask ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                editingTask ? 'Update Task' : 'Create Task'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TaskForm;