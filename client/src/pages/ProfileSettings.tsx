import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { AVATAR_OPTIONS } from '@/lib/auth';

const profileSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const ProfileSettings = () => {
  const navigate = useNavigate();
  const { user, updateProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(user?.avatar_url || AVATAR_OPTIONS[0]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: user?.full_name || '',
    },
  });

  const onSubmit = async (data: ProfileFormData) => {
    setIsLoading(true);
    setError('');

    try {
      const result = await updateProfile({
        full_name: data.fullName,
        avatar_url: selectedAvatar,
      });
      
      if (result.success) {
        toast({
          title: "Profile updated successfully!",
          description: "Your profile has been updated.",
        });
        navigate('/dashboard');
      } else {
        setError(result.error || 'Update failed');
        toast({
          title: "Update failed",
          description: result.error || 'Please try again.',
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Profile update error:', error);
      setError('An unexpected error occurred');
      toast({
        title: "Update failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">Please sign in to access profile settings.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto">
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
            <CardTitle className="text-2xl font-bold text-foreground">Profile Settings</CardTitle>
            <CardDescription className="text-muted-foreground">
              Update your profile information and avatar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Current Avatar Display */}
              <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                <img
                  src={user.avatar_url}
                  alt="Current avatar"
                  className="w-16 h-16 rounded-full border-2 border-primary"
                />
                <div>
                  <h3 className="font-medium text-foreground">{user.full_name}</h3>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              </div>

              {/* Full Name Field */}
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-foreground font-medium">Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  {...register('fullName')}
                  className={`bg-background border-border focus:border-ring transition-all duration-200 rounded-lg ${
                    errors.fullName ? 'border-destructive' : ''
                  }`}
                />
                {errors.fullName && (
                  <p className="text-sm text-destructive">{errors.fullName.message}</p>
                )}
              </div>

              {/* Avatar Selection */}
              <div className="space-y-3">
                <Label className="text-foreground font-medium">Choose Avatar</Label>
                <div className="grid grid-cols-6 gap-3 max-h-64 overflow-y-auto p-2 bg-muted/30 rounded-lg">
                  {AVATAR_OPTIONS.map((avatar, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setSelectedAvatar(avatar)}
                      className={`w-12 h-12 rounded-full border-2 transition-all duration-200 hover:scale-105 ${
                        selectedAvatar === avatar
                          ? 'border-primary scale-110 shadow-medium bg-primary/10'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <img
                        src={avatar}
                        alt={`Avatar ${index + 1}`}
                        className="w-full h-full rounded-full"
                      />
                    </button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Click on an avatar to select it. Your choice will be saved when you update your profile.
                </p>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-gradient-primary hover:opacity-90 text-white font-medium py-2.5 rounded-lg transition-all duration-200 shadow-medium"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating profile...
                  </>
                ) : (
                  'Update Profile'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfileSettings; 