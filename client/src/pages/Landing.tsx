import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Clock, Target, Users } from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Target className="h-6 w-6" />,
      title: "Smart Task Management",
      description: "Organize your tasks with intelligent prioritization and smart categorization."
    },
    {
      icon: <Clock className="h-6 w-6" />,
      title: "Time Tracking",
      description: "Track time spent on tasks and analyze your productivity patterns."
    },
    {
      icon: <CheckCircle className="h-6 w-6" />,
      title: "Progress Tracking",
      description: "Monitor your progress with visual indicators and completion statistics."
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Team Collaboration",
      description: "Work together with your team on shared projects and tasks."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center shadow-medium">
              <span className="text-white font-bold text-sm">TF</span>
            </div>
            <span className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">TaskFlow</span>
          </div>
          <Button 
            onClick={() => navigate('/login')}
            className="bg-gradient-primary hover:opacity-90 transition-all duration-200 rounded-lg shadow-medium"
          >
            Get Started
          </Button>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
            Transform Your
            <span className="bg-gradient-primary bg-clip-text text-transparent"> Productivity</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            A delightful and feature-rich task management app that makes productivity joyful. 
            Organize, track, and complete your tasks with ease.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg"
              onClick={() => navigate('/login')}
              className="bg-gradient-primary hover:opacity-90 text-lg px-8 py-3 rounded-lg transition-all duration-200 shadow-medium"
            >
              Start Managing Tasks
            </Button>
            <Button 
              size="lg"
              variant="outline"
              onClick={() => navigate('/register')}
              className="text-lg px-8 py-3 border-border hover:border-primary hover:text-primary transition-all duration-200 rounded-lg"
            >
              Create Account
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Everything you need to stay productive
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            TaskFlow combines powerful features with an intuitive interface to help you 
            manage your tasks efficiently and achieve your goals.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="border-border shadow-soft hover:shadow-medium transition-all duration-200 rounded-lg bg-card hover:bg-card-hover">
              <CardHeader className="text-center">
                <div className="mx-auto w-12 h-12 bg-primary-soft rounded-lg flex items-center justify-center text-primary mb-4">
                  {feature.icon}
                </div>
                <CardTitle className="text-lg text-foreground">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center text-muted-foreground">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="bg-gradient-primary rounded-lg p-8 md:p-12 text-center text-white shadow-strong">
          <h2 className="text-3xl font-bold mb-4">
            Ready to boost your productivity?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of users who have transformed their workflow with TaskFlow.
          </p>
          <Button 
            size="lg"
            variant="secondary"
            onClick={() => navigate('/register')}
            className="text-lg px-8 py-3 bg-white text-primary hover:bg-gray-50 transition-all duration-200 rounded-lg shadow-medium"
          >
            Get Started Free
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 text-center text-muted-foreground">
        <p>&copy; 2024 TaskFlow. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Landing; 