import { supabase } from './supabase'
import { toast } from '@/hooks/use-toast'

export interface AuthUser {
  id: string
  email: string
  full_name: string
  avatar_url: string
}

export interface SignUpData {
  email: string
  password: string
  full_name: string
  avatar_url: string
}

export interface SignInData {
  email: string
  password: string
}

// Avatar options (15 options as requested)
export const AVATAR_OPTIONS = [
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Jasper',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Luna',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Max',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Zoe',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Kai',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Aria',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Leo',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Maya',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Finn',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Chloe',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Owen',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Noah'
]

export class AuthService {
  // Helper function to create a profile for existing users
  static async createProfileForUser(userId: string, email: string): Promise<AuthUser | null> {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          full_name: 'User', // Default name
          email: email,
          avatar_url: AVATAR_OPTIONS[0], // Default avatar
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating profile:', error)
        return null
      }

      return {
        id: profile.id,
        email: profile.email,
        full_name: profile.full_name,
        avatar_url: profile.avatar_url,
      }
    } catch (error) {
      console.error('Error creating profile for user:', error)
      return null
    }
  }

  // Sign up with email and password
  static async signUp(data: SignUpData): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.full_name,
            avatar_url: data.avatar_url,
          }
        }
      })

      if (authError) {
        console.error('Signup error:', authError)
        return { success: false, error: authError.message }
      }

      if (authData.user) {
        // The profile will be automatically created by the database trigger
        // But we can also manually create it as a backup
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            full_name: data.full_name,
            email: data.email,
            avatar_url: data.avatar_url,
          })

        if (profileError && profileError.code !== '23505') { // Ignore duplicate key errors
          console.error('Profile creation error:', profileError)
        }

        toast({
          title: "Account created successfully!",
          description: "Please check your email to verify your account.",
        })

        return { success: true }
      }

      return { success: false, error: 'Failed to create account' }
    } catch (error) {
      console.error('Sign up error:', error)
      return { success: false, error: 'An unexpected error occurred' }
    }
  }

  // Sign in with email and password
  static async signIn(data: SignInData): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })

      if (authError) {
        console.error('Signin error:', authError)
        return { success: false, error: authError.message }
      }

      if (authData.user) {
        // Get user profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authData.user.id)
          .single()

        let userProfile: AuthUser | null = null

        if (profileError) {
          console.error('Profile fetch error:', profileError)
          
          // If profile doesn't exist, try to create one
          if (profileError.code === 'PGRST116') { // No rows returned
            console.log('Profile not found, creating one...')
            userProfile = await this.createProfileForUser(authData.user.id, authData.user.email!)
          } else {
            return { success: false, error: 'Failed to load user profile' }
          }
        } else if (profile) {
          userProfile = {
            id: profile.id,
            email: profile.email,
            full_name: profile.full_name,
            avatar_url: profile.avatar_url,
          }
        }

        if (!userProfile) {
          return { success: false, error: 'Failed to create or load user profile' }
        }

        // Store user data in localStorage for persistence
        localStorage.setItem('user', JSON.stringify(userProfile))

        toast({
          title: "Welcome back!",
          description: "You have been successfully logged in.",
        })

        return { success: true, user: userProfile }
      }

      return { success: false, error: 'Failed to sign in' }
    } catch (error) {
      console.error('Sign in error:', error)
      return { success: false, error: 'An unexpected error occurred' }
    }
  }

  // Sign out
  static async signOut(): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.auth.signOut()

      if (error) {
        return { success: false, error: error.message }
      }

      // Clear localStorage
      localStorage.removeItem('user')

      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      })

      return { success: true }
    } catch (error) {
      console.error('Sign out error:', error)
      return { success: false, error: 'An unexpected error occurred' }
    }
  }

  // Get current user
  static async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        return null
      }

      // Get user profile
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) {
        console.error('Profile fetch error:', error)
        
        // If profile doesn't exist, try to create one
        if (error.code === 'PGRST116') { // No rows returned
          console.log('Profile not found, creating one...')
          return await this.createProfileForUser(user.id, user.email!)
        }
        
        return null
      }

      if (!profile) {
        return null
      }

      return {
        id: profile.id,
        email: profile.email,
        full_name: profile.full_name,
        avatar_url: profile.avatar_url,
      }
    } catch (error) {
      console.error('Get current user error:', error)
      return null
    }
  }

  // Check if user is authenticated
  static async isAuthenticated(): Promise<boolean> {
    const user = await this.getCurrentUser()
    return user !== null
  }

  // Get user from localStorage (for persistence)
  static getStoredUser(): AuthUser | null {
    try {
      const userData = localStorage.getItem('user')
      return userData ? JSON.parse(userData) : null
    } catch (error) {
      console.error('Error parsing stored user:', error)
      return null
    }
  }

  // Update user profile
  static async updateProfile(userId: string, updates: Partial<{ full_name: string; avatar_url: string }>): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)

      if (error) {
        console.error('Profile update error:', error)
        return { success: false, error: error.message }
      }

      // Update stored user data
      const storedUser = this.getStoredUser()
      if (storedUser && storedUser.id === userId) {
        const updatedUser = { ...storedUser, ...updates }
        localStorage.setItem('user', JSON.stringify(updatedUser))
      }

      toast({
        title: "Profile updated!",
        description: "Your profile has been successfully updated.",
      })

      return { success: true }
    } catch (error) {
      console.error('Update profile error:', error)
      return { success: false, error: 'An unexpected error occurred' }
    }
  }
} 