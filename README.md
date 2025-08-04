# TaskFlow - Modern Task Management Application

A beautiful, feature-rich task management application built with React, TypeScript, and Supabase. TaskFlow helps you organize, prioritize, and complete your tasks with an elegant purple-blue gradient theme.

## ✨ Features

- **Modern UI/UX**: Elegant purple-blue gradient theme with professional aesthetics
- **Task Management**: Create, edit, complete, and delete tasks
- **Priority System**: High, medium, and low priority levels with color coding
- **Status Tracking**: Pending, completed, and deleted task states
- **Search & Filter**: Find tasks quickly with search and filter functionality
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Real-time Updates**: Instant synchronization with Supabase
- **User Authentication**: Secure login and registration with email verification
- **Profile Management**: Custom avatars and user profiles

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account (free tier works great!)

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd taskflow
```

### 2. Install Dependencies

```bash
npm run install:all
```

Or run the setup script:

```bash
node setup.js
```

### 3. Supabase Setup

1. **Create a Supabase Project**:
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Note your project URL and anon key

2. **Update Supabase Configuration**:
   - Open `client/src/lib/supabase.ts`
   - Replace the URL and anon key with your project credentials

3. **Run Database Setup**:
   - Go to your Supabase project dashboard
   - Open the SQL Editor
   - Copy and paste the contents of `supabase-setup.sql`
   - Run the SQL to create the necessary tables and policies

### 4. Start the Application

```bash
npm run dev
```

This will start both the frontend (port 5173) and backend (port 5000).

### 5. Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000

## 📁 Project Structure

```
taskflow/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # UI components
│   │   ├── contexts/      # React contexts
│   │   ├── hooks/         # Custom hooks
│   │   ├── lib/           # Utilities and services
│   │   ├── pages/         # Page components
│   │   └── styles/        # CSS and styling
│   └── public/            # Static assets
├── server/                # Express backend (backup)
├── models/                # Database models
├── supabase-setup.sql     # Database schema
└── setup.js              # Setup script
```

## 🎨 Theme System

TaskFlow uses a custom design system with:

- **Primary Colors**: Purple-blue gradient (256 90% 65% → 280 85% 70%)
- **Background**: Soft white (240 10% 98%)
- **Shadows**: Soft, medium, and strong shadow variants
- **Transitions**: Smooth 200ms animations
- **Border Radius**: 0.5rem (8px) for consistency

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the server directory:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
NODE_ENV=development
```

### Supabase Configuration

Update `client/src/lib/supabase.ts`:

```typescript
const supabaseUrl = 'your-project-url'
const supabaseAnonKey = 'your-anon-key'
```

## 🛠️ Development

### Available Scripts

```bash
# Install all dependencies
npm run install:all

# Start development servers
npm run dev

# Start only frontend
npm run dev:client

# Start only backend
npm run dev:server

# Build for production
npm run build

# Run setup script
node setup.js
```

### Database Schema

The application uses two main tables:

**profiles**:
- `id` (UUID, primary key)
- `full_name` (TEXT)
- `email` (TEXT)
- `avatar_url` (TEXT)
- `created_at` (TIMESTAMP)

**tasks**:
- `id` (UUID, primary key)
- `user_id` (UUID, foreign key)
- `title` (TEXT)
- `description` (TEXT, optional)
- `priority` (TEXT: 'low', 'medium', 'high')
- `status` (TEXT: 'pending', 'completed', 'deleted')
- `created_at` (TIMESTAMP)

## 🔐 Authentication

TaskFlow uses Supabase Auth with:

- Email/password authentication
- Email verification
- JWT tokens
- Row Level Security (RLS)
- Automatic profile creation

## 🎯 Key Features

### Task Management
- Create tasks with title, description, and priority
- Mark tasks as complete/incomplete
- Soft delete (move to deleted section)
- Restore deleted tasks
- Search and filter functionality

### User Experience
- Responsive design for all devices
- Smooth animations and transitions
- Real-time updates
- Offline support with localStorage
- Toast notifications

### Security
- Row Level Security in Supabase
- JWT token authentication
- Input validation
- XSS protection
- CORS configuration

## 🐛 Troubleshooting

### Common Issues

1. **Login Not Working**:
   - Check Supabase configuration in `client/src/lib/supabase.ts`
   - Verify email verification is complete
   - Check browser console for errors

2. **Database Errors**:
   - Ensure Supabase SQL setup is complete
   - Check RLS policies are enabled
   - Verify table structure matches schema

3. **Build Errors**:
   - Clear node_modules and reinstall
   - Check TypeScript configuration
   - Verify all dependencies are installed

### Debug Mode

Enable debug logging by setting `NODE_ENV=development` in your environment variables.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- [Supabase](https://supabase.com) for backend services
- [React](https://reactjs.org) for the frontend framework
- [TypeScript](https://typescriptlang.org) for type safety
- [Tailwind CSS](https://tailwindcss.com) for styling
- [Lucide React](https://lucide.dev) for icons

---

**TaskFlow** - Plan. Prioritize. Progress. ✨
