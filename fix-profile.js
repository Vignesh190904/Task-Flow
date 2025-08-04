// Quick fix script for existing user profile
// Run this in your browser console after logging into Supabase

// Replace this with your actual user ID from the error message
const userId = '3bebdd97-d0b3-4a24-961d-69130a79a8be';

// Create profile for existing user
const createProfile = async () => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        full_name: 'User', // You can change this to your actual name
        email: 'your-email@example.com', // Replace with your actual email
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating profile:', error);
    } else {
      console.log('Profile created successfully:', data);
    }
  } catch (error) {
    console.error('Error:', error);
  }
};

// Run the function
createProfile(); 