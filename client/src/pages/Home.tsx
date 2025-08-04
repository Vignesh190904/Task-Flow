import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { LogOut, User, Plus, CheckCircle, Clock, Target } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { TaskService } from '@/lib/tasks';

const Home = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [taskStats, setTaskStats] = useState({
    total: 0,
    pending: 0,
    completed: 0,
    deleted: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadTaskStats();
    }
  }, [user]);

  const loadTaskStats = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const stats = await TaskService.getTaskStats(user.id);
      setTaskStats(stats);
    } catch (error) {
      console.error('Error loading task stats:', error);
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

  if (!user) {
    return null; // Loading state
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-sm border-b border-border shadow-soft">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center shadow-medium">
                <span className="text-white font-bold text-sm">TF</span>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">TaskFlow</h1>
                <p className="text-sm text-muted-foreground">Welcome back, {user.full_name}!</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <img 
                  src={user.avatar_url} 
                  alt="Avatar" 
                  className="w-6 h-6 rounded-full border border-border"
                />
                <span>{user.email}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-muted-foreground hover:text-primary transition-all duration-200"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Welcome to TaskFlow, {user.full_name}! 👋
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Ready to boost your productivity? Let's organize your tasks and achieve your goals together.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="border-border shadow-soft hover:shadow-medium transition-all duration-200 rounded-lg bg-card">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-primary-soft rounded-lg flex items-center justify-center text-primary mb-4">
                <Target className="h-6 w-6" />
              </div>
              <CardTitle className="text-lg text-foreground">Total Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-center text-foreground">
                {loading ? '...' : taskStats.total}
              </p>
              <p className="text-sm text-muted-foreground text-center">
                {loading ? 'Loading...' : taskStats.total === 0 ? 'No tasks yet' : 'Active tasks'}
              </p>
            </CardContent>
          </Card>

          <Card className="border-border shadow-soft hover:shadow-medium transition-all duration-200 rounded-lg bg-card">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-warning-soft rounded-lg flex items-center justify-center text-warning mb-4">
                <Clock className="h-6 w-6" />
              </div>
              <CardTitle className="text-lg text-foreground">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-center text-foreground">
                {loading ? '...' : taskStats.pending}
              </p>
              <p className="text-sm text-muted-foreground text-center">
                {loading ? 'Loading...' : taskStats.pending === 0 ? 'No pending tasks' : 'Tasks to complete'}
              </p>
            </CardContent>
          </Card>

          <Card className="border-border shadow-soft hover:shadow-medium transition-all duration-200 rounded-lg bg-card">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-success-soft rounded-lg flex items-center justify-center text-success mb-4">
                <CheckCircle className="h-6 w-6" />
              </div>
              <CardTitle className="text-lg text-foreground">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-center text-foreground">
                {loading ? '...' : taskStats.completed}
              </p>
              <p className="text-sm text-muted-foreground text-center">
                {loading ? 'Loading...' : taskStats.completed === 0 ? 'No completed tasks' : 'Tasks finished'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Empty State */}
        {!loading && taskStats.total === 0 && (
          <Card className="border-border shadow-soft max-w-2xl mx-auto rounded-lg bg-card">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-primary-soft rounded-full flex items-center justify-center text-primary mb-4">
                <Plus className="h-8 w-8" />
              </div>
              <CardTitle className="text-2xl font-bold text-foreground">You have no tasks today</CardTitle>
              <CardDescription className="text-muted-foreground">
                Start by creating your first task to get organized and boost your productivity.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button 
                size="lg"
                className="bg-gradient-primary hover:opacity-90 text-white font-medium px-8 py-3 rounded-lg transition-all duration-200 shadow-medium"
                onClick={() => navigate('/dashboard')}
              >
                <Plus className="h-5 w-5 mr-2" />
                Create Your First Task
              </Button>
              <p className="text-sm text-muted-foreground mt-4">
                Or explore the dashboard to see all your task management features
              </p>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="mt-8 text-center">
          <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
          <div className="flex flex-wrap justify-center gap-4">
            <Button 
              variant="outline"
              onClick={() => navigate('/dashboard')}
              className="border-border hover:border-primary hover:text-primary transition-all duration-200 rounded-lg"
            >
              <Target className="h-4 w-4 mr-2" />
              View Dashboard
            </Button>
            <Button 
              variant="outline"
              onClick={() => navigate('/dashboard')}
              className="border-border hover:border-primary hover:text-primary transition-all duration-200 rounded-lg"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </Button>
            <Button 
              variant="outline"
              onClick={() => navigate('/dashboard')}
              className="border-border hover:border-primary hover:text-primary transition-all duration-200 rounded-lg"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              View Completed
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home; 