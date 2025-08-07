import { supabase } from './supabase'
import { toast } from '@/hooks/use-toast'

export interface AuthUser {
  id: string
  email: string
  full_name: string
  avatar_url: string
  custom_avatar_url?: string
  is_verified?: boolean
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
        custom_avatar_url: profile.custom_avatar_url,
        is_verified: profile.is_verified,
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

        if (profileError) {
          console.error('Profile creation error:', profileError)
        }

        return { success: true }
      }

      return { success: false, error: 'Signup failed' }
    } catch (error) {
      console.error('Signup error:', error)
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

        if (profileError) {
          console.error('Profile fetch error:', profileError)
          
          // If profile doesn't exist, create one
          if (profileError.code === 'PGRST116') {
            console.log('Profile not found, creating one...')
            const createdProfile = await this.createProfileForUser(authData.user.id, authData.user.email!)
            if (createdProfile) {
              return { success: true, user: createdProfile }
            }
          }
          
          return { success: false, error: 'Failed to load user profile' }
        }

        const user: AuthUser = {
          id: profile.id,
          email: profile.email,
          full_name: profile.full_name,
          avatar_url: profile.avatar_url,
          custom_avatar_url: profile.custom_avatar_url,
          is_verified: profile.is_verified,
        }

        // Store user in localStorage for immediate UI response
        localStorage.setItem('user', JSON.stringify(user))

        return { success: true, user }
      }

      return { success: false, error: 'Signin failed' }
    } catch (error) {
      console.error('Signin error:', error)
      return { success: false, error: 'An unexpected error occurred' }
    }
  }

  // Sign in with Google OAuth
  static async signInWithGoogle(): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      })

      if (error) {
        console.error('Google signin error:', error)
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      console.error('Google signin error:', error)
      return { success: false, error: 'An unexpected error occurred' }
    }
  }

  // Send OTP for Google users
  static async sendOTP(email: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      })

      if (error) {
        console.error('OTP send error:', error)
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      console.error('OTP send error:', error)
      return { success: false, error: 'An unexpected error occurred' }
    }
  }

  // Verify OTP
  static async verifyOTP(email: string, token: string): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: email,
        token: token,
        type: 'email',
      })

      if (error) {
        console.error('OTP verification error:', error)
        return { success: false, error: error.message }
      }

      if (data.user) {
        // Update user verification status
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ is_verified: true })
          .eq('id', data.user.id)

        if (updateError) {
          console.error('Profile update error:', updateError)
        }

        // Get user profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single()

        if (profileError) {
          console.error('Profile fetch error:', profileError)
          return { success: false, error: 'Failed to load user profile' }
        }

        const user: AuthUser = {
          id: profile.id,
          email: profile.email,
          full_name: profile.full_name,
          avatar_url: profile.avatar_url,
          custom_avatar_url: profile.custom_avatar_url,
          is_verified: profile.is_verified,
        }

        localStorage.setItem('user', JSON.stringify(user))
        return { success: true, user }
      }

      return { success: false, error: 'OTP verification failed' }
    } catch (error) {
      console.error('OTP verification error:', error)
      return { success: false, error: 'An unexpected error occurred' }
    }
  }

  // Sign out
  static async signOut(): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        console.error('Signout error:', error)
        return { success: false, error: error.message }
      }

      // Clear localStorage
      localStorage.removeItem('user')

      return { success: true }
    } catch (error) {
      console.error('Signout error:', error)
      return { success: false, error: 'An unexpected error occurred' }
    }
  }

  // Get current user
  static async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error || !user) {
        console.error('Get current user error:', error)
        return null
      }

      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileError) {
        console.error('Profile fetch error:', profileError)
        
        // If profile doesn't exist, create one
        if (profileError.code === 'PGRST116') {
          console.log('Profile not found, creating one...')
          return await this.createProfileForUser(user.id, user.email!)
        }
        
        return null
      }

      const authUser: AuthUser = {
        id: profile.id,
        email: profile.email,
        full_name: profile.full_name,
        avatar_url: profile.avatar_url,
        custom_avatar_url: profile.custom_avatar_url,
        is_verified: profile.is_verified,
      }

      // Update localStorage
      localStorage.setItem('user', JSON.stringify(authUser))

      return authUser
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

  // Get stored user from localStorage
  static getStoredUser(): AuthUser | null {
    try {
      const userStr = localStorage.getItem('user')
      return userStr ? JSON.parse(userStr) : null
    } catch (error) {
      console.error('Error parsing stored user:', error)
      return null
    }
  }

  // Update user profile
  static async updateProfile(userId: string, updates: Partial<{ full_name: string; avatar_url: string; custom_avatar_url: string }>): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)

      if (error) {
        console.error('Profile update error:', error)
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      console.error('Profile update error:', error)
      return { success: false, error: 'An unexpected error occurred' }
    }
  }
} 