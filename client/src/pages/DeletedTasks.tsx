import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
import { toast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft, Trash2, RotateCcw, Calendar, Clock } from 'lucide-react';
import { SearchBar } from '@/components/SearchBar';
import { TaskService } from '@/lib/tasks';
import { Task } from '@/lib/supabase';
import TaskCard from '@/components/TaskCard';

const DeletedTasks = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingStates, setLoadingStates] = useState<{ [key: string]: boolean }>({});
  const [showDeleteDialog, setShowDeleteDialog] = useState<{ [key: string]: boolean }>({});
  const [restoreLoading, setRestoreLoading] = useState<{ [key: string]: boolean }>({});
  const [deleteLoading, setDeleteLoading] = useState<{ [key: string]: boolean }>({});

  // Load deleted tasks function - stable and memoized
  const loadDeletedTasks = useCallback(async (query: string = '') => {
    try {
      setLoading(true);
      setError(null);
      const deletedTasks = await TaskService.getTasks({ 
        status: 'deleted',
        search: query 
      });
      setTasks(deletedTasks);
    } catch (error) {
      console.error('Error loading deleted tasks:', error);
      setError('Failed to load deleted tasks');
      toast({
        title: "Error",
        description: "Failed to load deleted tasks. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // Search handler - stable and doesn't cause re-renders
  const handleSearch = useCallback(async (query: string) => {
    setSearchQuery(query);
    setSearchLoading(true);
    try {
      const filteredTasks = await TaskService.getTasks({ 
        status: 'deleted',
        search: query 
      });
      setTasks(filteredTasks);
    } catch (error) {
      console.error('Error searching tasks:', error);
      toast({
        title: "Search Error",
        description: "Failed to search tasks. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSearchLoading(false);
    }
  }, []);

  // Load tasks only on component mount
  useEffect(() => {
    loadDeletedTasks();
  }, []); // Empty dependency array - only run on mount

  // Restore task handler
  const handleRestore = useCallback(async (taskId: string) => {
    setRestoreLoading(prev => ({ ...prev, [taskId]: true }));
    try {
      await TaskService.restoreTask(taskId);
      toast({
        title: "✅ Task Restored",
        description: "Task has been successfully restored to pending tasks.",
      });
      // Reload with current search query
      loadDeletedTasks(searchQuery);
    } catch (error) {
      console.error('Error restoring task:', error);
      toast({
        title: "❌ Restore Failed",
        description: "Failed to restore task. Please try again.",
        variant: "destructive",
      });
    } finally {
      setRestoreLoading(prev => ({ ...prev, [taskId]: false }));
    }
  }, [loadDeletedTasks, searchQuery]);

  // Permanent delete handler
  const handlePermanentDelete = useCallback(async (taskId: string) => {
    setDeleteLoading(prev => ({ ...prev, [taskId]: true }));
    try {
      await TaskService.permanentlyDeleteTask(taskId);
      toast({
        title: "🗑️ Task Deleted",
        description: "Task has been permanently deleted from the database.",
      });
      // Reload with current search query
      loadDeletedTasks(searchQuery);
    } catch (error) {
      console.error('Error permanently deleting task:', error);
      toast({
        title: "❌ Delete Failed",
        description: "Failed to permanently delete task. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeleteLoading(prev => ({ ...prev, [taskId]: false }));
      setShowDeleteDialog(prev => ({ ...prev, [taskId]: false }));
    }
  }, [loadDeletedTasks, searchQuery]);

  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  }, []);

  const formatTime = useCallback((timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading deleted tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/dashboard')}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>

        <Card className="shadow-medium border-border rounded-lg bg-card">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-foreground">Deleted Tasks</CardTitle>
            <CardDescription className="text-muted-foreground">
              Restore or permanently delete your deleted tasks
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Search Bar */}
            <div className="mb-6">
              <SearchBar 
                onSearch={handleSearch}
                placeholder="Search deleted tasks..."
                isLoading={searchLoading}
              />
            </div>

            {/* Tasks List */}
            {tasks.length === 0 ? (
              <div className="text-center py-12">
                <Trash2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No deleted tasks</h3>
                <p className="text-muted-foreground">
                  {searchQuery ? 'No tasks match your search.' : 'You haven\'t deleted any tasks yet.'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {tasks.map((task) => (
                  <Card key={task.id} className="border-border hover:shadow-soft transition-all duration-200">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-foreground mb-1">{task.title}</h3>
                          {task.description && (
                            <p className="text-sm text-muted-foreground mb-2">{task.description}</p>
                          )}
                          
                          {/* Due Date and Time */}
                          {(task.due_date || task.due_time) && (
                            <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                              {task.due_date && (
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {formatDate(task.due_date)}
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
                          <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mb-3">
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

                          {/* Deleted Date */}
                          {task.deleted_at && (
                            <p className="text-xs text-muted-foreground">
                              Deleted on {formatDate(task.deleted_at)}
                            </p>
                          )}

                          {/* Restored Date (if previously restored) */}
                          {task.restored_at && (
                            <p className="text-xs text-success">
                              Previously restored on {formatDate(task.restored_at)}
                            </p>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3 ml-4 flex-shrink-0 min-w-0">
                          {/* Restore Button */}
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleRestore(task.id)}
                            disabled={restoreLoading[task.id]}
                            className="h-9 w-9 p-0 bg-green-500 hover:bg-green-600 text-white border-0 shadow-sm transition-all duration-200 flex-shrink-0"
                            title="Restore Task to Pending"
                          >
                            {restoreLoading[task.id] ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <RotateCcw className="h-4 w-4" />
                            )}
                          </Button>
                          
                          {/* Permanent Delete Button */}
                          <AlertDialog 
                            open={showDeleteDialog[task.id] || false} 
                            onOpenChange={(open) => setShowDeleteDialog(prev => ({ ...prev, [task.id]: open }))}
                          >
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="default"
                                size="sm"
                                disabled={deleteLoading[task.id]}
                                className="h-9 w-9 p-0 bg-red-500 hover:bg-red-600 text-white border-0 shadow-sm transition-all duration-200 flex-shrink-0"
                                title="Permanently Delete Task"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>🗑️ Permanently Delete Task?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action will <strong>permanently delete</strong> the task from the database. 
                                  This cannot be undone and the task will be lost forever. 
                                  Are you sure you want to proceed?
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel disabled={deleteLoading[task.id]}>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handlePermanentDelete(task.id)}
                                  disabled={deleteLoading[task.id]}
                                  className="bg-red-500 hover:bg-red-600"
                                >
                                  {deleteLoading[task.id] ? "Deleting..." : "Delete Permanently"}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DeletedTasks; 