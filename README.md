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
cd client
npm install
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

This will start the frontend (port 5173).

### 5. Access the Application

- **Frontend**: http://localhost:5173

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
├── supabase-setup.sql     # Database schema
└── setup.js               # Setup script
```

## 🛠️ Development

### Available Scripts

```bash
# Install frontend dependencies
cd client && npm install

# Start frontend
cd client && npm run dev

# Build for production
cd client && npm run build

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

## 🔑 Authentication

TaskFlow uses Supabase Auth with:

- Email/password authentication
- Email verification
- JWT tokens
- Row Level Security (RLS)
- Automatic profile creation

## Deployment Instructions

### Frontend (GitHub Pages)
- **Build Command:** `npm run build`
- **Build Directory:** `client/dist`
- **Base Path:** Set to `/Task-Flow/` in `vite.config.ts`.
- **Homepage:** Set to `https://vignesh190904.github.io/Task-Flow/` in `package.json`.
- **Deploy:** Push the contents of `client/dist` to the `gh-pages` branch or use GitHub Actions for automatic deployment.

---
