Odoo Hackathon
Problem Statement: Skill Swap Platform

Team Members:
- Shaurya Aggarwal
- Abhinav Srivastava
- Parul Shrivastava

# Skill Swap Platform

A comprehensive web application that enables users to list their skills and request others in return. Built with React, Node.js, Express, and SQLite.

## Features

### User Features
- **User Registration & Authentication**: Secure user registration and login system
- **Profile Management**: Users can create and manage their profiles with optional location and availability
- **Skill Management**: Add skills you can offer and skills you want to learn
- **User Browsing**: Search and filter users by skills, location, and other criteria
- **Swap Requests**: Send, accept, reject, and cancel swap requests
- **Rating System**: Rate and provide feedback after completed swaps
- **Profile Privacy**: Make profiles public or private

### Admin Features
- **User Management**: View all users, ban/unban users
- **Platform Monitoring**: View platform statistics and recent activity
- **Swap Management**: Monitor all swap requests and their status
- **Reports**: Download user activity and swap statistics reports
- **Admin Messages**: Send platform-wide messages to users

## Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **SQLite** - Database
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **multer** - File uploads
- **express-validator** - Input validation

### Frontend
- **React** - UI library
- **React Router** - Client-side routing
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **React Hook Form** - Form handling
- **Lucide React** - Icons
- **React Hot Toast** - Notifications

## Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd skill-swap-platform
   ```

2. **Install dependencies**
   ```bash
   # Install backend dependencies
   npm install
   
   # Install frontend dependencies
   cd client
   npm install
   cd ..
   ```

3. **Start the application**
   ```bash
   # Start both backend and frontend
   npm run dev
   ```

   Or use the provided scripts:
   - Windows: `start.bat`
   - Unix/Linux: `./start.sh`

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - Health Check: http://localhost:5000/api/health

### Default Admin Account
- **Email**: admin@skillswap.com
- **Password**: admin123

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/change-password` - Change password

### Users
- `GET /api/users/browse` - Browse users with filters
- `GET /api/users/:userId` - Get user profile
- `GET /api/users/me/skills` - Get current user's skills
- `POST /api/users/me/skills/offered` - Add offered skill
- `POST /api/users/me/skills/wanted` - Add wanted skill
- `DELETE /api/users/me/skills/offered/:skillId` - Remove offered skill
- `DELETE /api/users/me/skills/wanted/:skillId` - Remove wanted skill

### Skills
- `GET /api/skills` - Get all skills with filters
- `GET /api/skills/categories` - Get skill categories
- `GET /api/skills/:skillId` - Get skill details
- `GET /api/skills/search/autocomplete` - Search skills
- `GET /api/skills/popular/list` - Get popular skills

### Swaps
- `POST /api/swaps` - Create swap request
- `GET /api/swaps/my-requests` - Get user's swap requests
- `PUT /api/swaps/:swapId/accept` - Accept swap request
- `PUT /api/swaps/:swapId/reject` - Reject swap request
- `DELETE /api/swaps/:swapId` - Cancel swap request
- `POST /api/swaps/:swapId/rate` - Rate completed swap
- `GET /api/swaps/:swapId` - Get swap details

### Admin (Admin only)
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:userId/ban` - Ban/unban user
- `GET /api/admin/stats` - Get platform statistics
- `GET /api/admin/swaps` - Get all swap requests
- `POST /api/admin/messages` - Create admin message
- `GET /api/admin/messages` - Get admin messages
- `PUT /api/admin/messages/:messageId` - Update admin message
- `DELETE /api/admin/messages/:messageId` - Delete admin message
- `GET /api/admin/reports/user-activity` - Download user activity report
- `GET /api/admin/reports/swap-stats` - Download swap statistics report

## Database Schema

### Tables
- **users** - User accounts and profiles
- **skills** - Available skills in the platform
- **user_skills_offered** - Skills users can offer
- **user_skills_wanted** - Skills users want to learn
- **swap_requests** - Skill swap requests
- **ratings** - User ratings and feedback
- **admin_messages** - Platform-wide messages

## Project Structure

```
skill-swap-platform/
├── server/                 # Backend code
│   ├── database/          # Database initialization
│   ├── middleware/        # Authentication middleware
│   ├── routes/           # API routes
│   ├── uploads/          # File uploads
│   └── index.js          # Server entry point
├── client/               # Frontend code
│   ├── public/           # Static files
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── contexts/     # React contexts
│   │   └── index.js      # App entry point
│   └── package.json
├── package.json          # Root package.json
├── start.bat            # Windows startup script
├── start.sh             # Unix startup script
└── README.md            # This file
```

## Development

### Available Scripts

```bash
# Install all dependencies
npm run install-all

# Start development servers (backend + frontend)
npm run dev

# Start backend only
npm run server


### Environment Variables

Create a `.env` file in the root directory:

```env
NODE_ENV=development
PORT=5000
JWT_SECRET=confidential
MONGODB_URI=confidential
```

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Input validation and sanitization
- Rate limiting
- CORS protection
- Helmet security headers
- File upload restrictions

## License

This project is licensed under the MIT License.

## Support

For support or questions, please open an issue in the repository. 
