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
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { SearchBar } from './SearchBar';

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
  isSearchLoading?: boolean;
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
  taskCounts,
  isSearchLoading
}: SidebarProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-card border-r border-border w-80 shadow-soft">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center shadow-medium">
              <CheckSquare className="h-5 w-5 text-white" />
            </div>
            <h1 className="font-bold text-xl bg-gradient-primary bg-clip-text text-transparent">
              TaskFlow
            </h1>
          </div>
          
          {/* Mobile close button */}
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 md:hidden hover:bg-muted transition-all duration-200"
            onClick={() => setIsMobileOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="p-4 border-b border-border">
        <SearchBar
          onSearch={onSearchChange}
          placeholder="Search tasks..."
          className="w-full"
          isLoading={isSearchLoading}
        />
      </div>

      {/* Add Task Button */}
      <div className="p-4">
        <Button
          onClick={onAddTask}
          className="w-full bg-gradient-primary hover:opacity-90 text-white shadow-medium rounded-lg font-medium transition-all duration-200"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add New Task
        </Button>
      </div>

      {/* Navigation */}
      <div className="flex-1 px-4 py-2">
        <nav className="space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const count = taskCounts[item.id];
            const isActive = currentFilter === item.id;
            
            return (
              <Button
                key={item.id}
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-3 px-3 py-2 rounded-lg transition-all duration-200",
                  "hover:bg-muted hover:text-foreground",
                  isActive && "bg-primary-soft text-primary border border-primary/20 shadow-soft"
                )}
                onClick={() => onFilterChange(item.id)}
              >
                <Icon className="h-4 w-4" />
                <span className="flex-1 text-left">{item.label}</span>
                <span className={cn(
                  "px-2 py-0.5 text-xs rounded-full font-medium",
                  isActive 
                    ? "bg-primary/20 text-primary" 
                    : "bg-muted text-muted-foreground"
                )}>
                  {count}
                </span>
              </Button>
            );
          })}
        </nav>
      </div>

      {/* User Profile & Settings */}
      <div className="p-4 border-t border-border">
        {user && (
          <div className="flex items-center gap-3 mb-3">
            <img
              src={user.custom_avatar_url || user.avatar_url}
              alt={user.full_name}
              className="w-8 h-8 rounded-full border border-border"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {user.full_name}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {user.email}
              </p>
            </div>
          </div>
        )}
        
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/profile')}
            className="flex-1 text-xs hover:bg-muted transition-all duration-200"
          >
            Settings
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => signOut()}
            className="text-xs hover:bg-destructive/10 hover:text-destructive transition-all duration-200"
          >
            Sign Out
          </Button>
        </div>
        
        <div className="text-xs text-muted-foreground text-center mt-3">
          <p>Task-Flow v2.2</p>
          <p className="mt-1">Project By Vignesh</p>
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
        className="fixed top-4 left-4 z-50 md:hidden bg-card shadow-soft rounded-lg transition-all duration-200"
        onClick={() => setIsMobileOpen(true)}
      >
        <Menu className="h-4 w-4" />
      </Button>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0",
        isMobileOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <SidebarContent />
      </div>
    </>
  );
}