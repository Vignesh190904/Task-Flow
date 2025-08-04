import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { AuthService, AuthUser } from '@/lib/auth'

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signUp: (email: string, password: string, fullName: string, avatarUrl: string) => Promise<{ success: boolean; error?: string }>
  signOut: () => Promise<{ success: boolean; error?: string }>
  updateProfile: (updates: Partial<{ full_name: string; avatar_url: string }>) => Promise<{ success: boolean; error?: string }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // First check localStorage for immediate UI response
        const storedUser = AuthService.getStoredUser()
        if (storedUser) {
          setUser(storedUser)
        }

        // Then verify with Supabase
        const currentUser = await AuthService.getCurrentUser()
        if (currentUser) {
          setUser(currentUser)
          // Update localStorage with fresh data
          localStorage.setItem('user', JSON.stringify(currentUser))
        } else {
          // Clear localStorage if no valid session
          localStorage.removeItem('user')
          setUser(null)
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()
  }, [])

  const signIn = async (email: string, password: string) => {
    const result = await AuthService.signIn({ email, password })
    if (result.success && result.user) {
      setUser(result.user)
    }
    return result
  }

  const signUp = async (email: string, password: string, fullName: string, avatarUrl: string) => {
    return await AuthService.signUp({ email, password, full_name: fullName, avatar_url: avatarUrl })
  }

  const signOut = async () => {
    const result = await AuthService.signOut()
    if (result.success) {
      setUser(null)
    }
    return result
  }

  const updateProfile = async (updates: Partial<{ full_name: string; avatar_url: string }>) => {
    if (!user) {
      return { success: false, error: 'No user logged in' }
    }

    const result = await AuthService.updateProfile(user.id, updates)
    if (result.success) {
      setUser({ ...user, ...updates })
    }
    return result
  }

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
} 