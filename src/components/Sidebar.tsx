import { useState } from 'react';
import { 
  CheckSquare, 
  Square, 
  Trash2, 
  Calendar, 
  Search,
  Plus,
  Menu,
  X,
  Home
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export type TaskFilter = 'all' | 'pending' | 'completed' | 'deleted';

interface SidebarProps {
  currentFilter: TaskFilter;
  onFilterChange: (filter: TaskFilter) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onAddTask: () => void;
  taskCounts: {
    all: number;
    pending: number;
    completed: number;
    deleted: number;
  };
}

const navigationItems = [
  { id: 'all' as TaskFilter, label: 'All Tasks', icon: Home },
  { id: 'pending' as TaskFilter, label: 'Pending', icon: Square },
  { id: 'completed' as TaskFilter, label: 'Completed', icon: CheckSquare },
  { id: 'deleted' as TaskFilter, label: 'Deleted', icon: Trash2 },
];

export function Sidebar({ 
  currentFilter, 
  onFilterChange, 
  searchQuery, 
  onSearchChange, 
  onAddTask,
  taskCounts 
}: SidebarProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-gradient-soft border-r border-border-soft">
      {/* Header */}
      <div className="p-6 border-b border-border-soft">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <CheckSquare className="h-4 w-4 text-white" />
            </div>
            <h1 className="font-bold text-lg bg-gradient-primary bg-clip-text text-transparent">
              TaskFlow
            </h1>
          </div>
          
          {/* Mobile close button */}
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 md:hidden"
            onClick={() => setIsMobileOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="p-4 border-b border-border-soft">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 bg-input border-border-soft focus:border-primary"
          />
        </div>
      </div>

      {/* Add Task Button */}
      <div className="p-4">
        <Button
          onClick={onAddTask}
          className="w-full bg-gradient-primary hover:opacity-90 shadow-medium"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add New Task
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navigationItems.map((item) => {
          const count = taskCounts[item.id];
          const isActive = currentFilter === item.id;
          
          return (
            <Button
              key={item.id}
              variant="ghost"
              className={cn(
                "w-full justify-start gap-3 h-12 rounded-xl transition-all duration-200",
                "hover:bg-primary-soft hover:text-primary",
                isActive && "bg-primary-soft text-primary border border-primary/20 shadow-soft"
              )}
              onClick={() => {
                onFilterChange(item.id);
                setIsMobileOpen(false);
              }}
            >
              <item.icon className="h-4 w-4" />
              <span className="flex-1 text-left">{item.label}</span>
              <span className={cn(
                "text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground",
                isActive && "bg-primary/10 text-primary"
              )}>
                {count}
              </span>
            </Button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border-soft">
        <div className="text-xs text-muted-foreground text-center space-y-1">
          <p>Built with ❤️ using Lovable</p>
          <p>Stay productive, stay focused!</p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="sm"
        className="fixed top-4 left-4 z-50 md:hidden bg-card shadow-medium"
        onClick={() => setIsMobileOpen(true)}
      >
        <Menu className="h-4 w-4" />
      </Button>

      {/* Desktop sidebar */}
      <div className="hidden md:block w-80 h-screen">
        <SidebarContent />
      </div>

      {/* Mobile sidebar overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div 
            className="absolute inset-0 bg-background/80 backdrop-blur-sm" 
            onClick={() => setIsMobileOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full w-80 max-w-[85vw] animate-slide-in-right">
            <SidebarContent />
          </div>
        </div>
      )}
    </>
  );
}