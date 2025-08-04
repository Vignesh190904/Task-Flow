#!/usr/bin/env node

import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🚀 TaskFlow Setup Script');
console.log('========================\n');

// Check if we're in the right directory
const packageJsonPath = join(__dirname, 'package.json');
if (!existsSync(packageJsonPath)) {
  console.error('❌ Error: Please run this script from the project root directory');
  process.exit(1);
}

try {
  console.log('📦 Installing dependencies...');
  
  // Install root dependencies
  execSync('npm install', { stdio: 'inherit' });
  
  // Install client dependencies
  console.log('\n📦 Installing client dependencies...');
  execSync('cd client && npm install', { stdio: 'inherit' });
  
  // Install server dependencies
  console.log('\n📦 Installing server dependencies...');
  execSync('cd server && npm install', { stdio: 'inherit' });
  
  console.log('\n✅ Dependencies installed successfully!');
  
  console.log('\n📋 Setup Instructions:');
  console.log('======================');
  console.log('');
  console.log('1. 🗄️  Supabase Setup:');
  console.log('   - Go to https://supabase.com and create a new project');
  console.log('   - Copy your project URL and anon key');
  console.log('   - Update client/src/lib/supabase.ts with your credentials');
  console.log('   - Run the SQL from supabase-setup.sql in your Supabase SQL Editor');
  console.log('');
  console.log('2. 🔧 Environment Setup:');
  console.log('   - Create a .env file in the server directory with:');
  console.log('     MONGODB_URI=your_mongodb_connection_string');
  console.log('     JWT_SECRET=your_jwt_secret');
  console.log('     NODE_ENV=development');
  console.log('');
  console.log('3. 🚀 Start the Application:');
  console.log('   - Run: npm run dev');
  console.log('   - This will start both client and server');
  console.log('');
  console.log('4. 🌐 Access the Application:');
  console.log('   - Frontend: http://localhost:5173');
  console.log('   - Backend API: http://localhost:5000');
  console.log('');
  console.log('📝 Note: The application uses Supabase for authentication and data storage.');
  console.log('   The Express server is set up as a backup but not currently used.');
  console.log('');
  console.log('🎉 Setup complete! Happy coding! 🎉');
  
} catch (error) {
  console.error('❌ Setup failed:', error.message);
  process.exit(1);
} 