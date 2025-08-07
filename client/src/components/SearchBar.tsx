import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  className?: string;
  initialValue?: string;
  isLoading?: boolean;
}

export function SearchBar({ 
  onSearch, 
  placeholder = "Search tasks...", 
  className = '',
  initialValue = '',
  isLoading = false
}: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState(initialValue);
  const [isFocused, setIsFocused] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Stable debounced search function
  const debouncedSearch = useCallback((query: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      onSearch(query);
    }, 300);
  }, [onSearch]);

  // Handle input change without causing re-renders
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    debouncedSearch(value);
  }, [debouncedSearch]);

  // Handle clear button
  const handleClear = useCallback(() => {
    setSearchQuery('');
    onSearch('');
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    // Keep focus on input after clearing
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [onSearch]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Only update search query if initialValue actually changes
  useEffect(() => {
    if (initialValue !== searchQuery && initialValue !== undefined) {
      setSearchQuery(initialValue);
    }
  }, [initialValue]);

  return (
    <div className={cn("relative", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={searchQuery}
          onChange={handleInputChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={isLoading}
          className={cn(
            "pl-10 pr-10 bg-background border-border focus:border-ring rounded-lg transition-all duration-200",
            isFocused && "ring-2 ring-ring/20",
            isLoading && "opacity-70 cursor-not-allowed"
          )}
        />
        {isLoading && (
          <Loader2 className="absolute right-10 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground animate-spin" />
        )}
        {searchQuery && !isLoading && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-muted"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
      
      {searchQuery && (
        <div className="mt-2 text-xs text-muted-foreground flex items-center gap-2">
          <span>Searching for: "{searchQuery}"</span>
          {isLoading && <Loader2 className="h-3 w-3 animate-spin" />}
        </div>
      )}
    </div>
  );
} 