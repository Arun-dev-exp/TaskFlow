# TaskFlow - Task & Habit Management Application

A modern, full-stack task and habit tracking application built with React, TypeScript, Node.js, and PostgreSQL.

## Features

- ✅ **Task Management**: Create, update, delete, and toggle completion of tasks
- 🎯 **Habit Tracking**: Build and monitor daily habits with completion history
- 🏷️ **Categories**: Organize tasks by work, personal, health, learning, and other
- ⏰ **Time Blocking**: Schedule tasks with specific time slots
- 📊 **Dashboard**: View statistics and progress at a glance
- 🔍 **Filtering**: Filter tasks by status, category, and search terms
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile devices

## Tech Stack

### Frontend
- React 18 with TypeScript
- Vite for fast development and building
- Tailwind CSS for styling
- Lucide React for icons
- Context API for state management

### Backend
- Node.js with Express
- PostgreSQL database
- RESTful API design
- JWT authentication (ready for implementation)
- Rate limiting and security middleware

## Project Structure

```
TaskFlow/
├── src/                    # Frontend source code
│   ├── components/         # React components
│   ├── context/           # React context for state management
│   ├── types/             # TypeScript type definitions
│   └── utils/             # Utility functions
├── backend/               # Backend server code
│   ├── db/               # Database connection and utilities
│   ├── routes/           # API route handlers
│   └── server.js         # Main server file
├── database/              # Database schema and migrations
└── README.md             # This file
```

## Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- Git

### 1. Clone the Repository

```bash
git clone <repository-url>
cd TaskFlow
```

### 2. Database Setup

1. **Install PostgreSQL** if you haven't already
2. **Create the database**:
   ```sql
   CREATE DATABASE "Task Flow";
   ```
3. **Run the schema file** in pgAdmin or psql:
   - Open the `database/schema.sql` file
   - Copy all contents and paste into your PostgreSQL query editor
   - Execute the script

### 3. Backend Setup

1. **Navigate to backend directory**:
   ```bash
   cd backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Create environment file**:
   ```bash
   # Copy the example file
   cp ../env.example .env
   
   # Edit .env with your database credentials
   DB_USER=postgre
   DB_PASSWORD=your password
   DB_NAME=Task Flow
   DB_HOST=localhost
   DB_PORT=5432
   PORT=5000
   NODE_ENV=development
   ```

4. **Start the backend server**:
   ```bash
   # Development mode with auto-reload
   npm run dev
   
   # Production mode
   npm start
   ```

   The backend will be available at `http://localhost:5000`

### 4. Frontend Setup

1. **Open a new terminal and navigate to the root directory**:
   ```bash
   cd ..  # If you're in the backend directory
   ```

2. **Install frontend dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

   The frontend will be available at `http://localhost:5173`

## API Endpoints

### Tasks
- `GET /api/tasks` - Get all tasks (with filtering)
- `GET /api/tasks/:id` - Get specific task
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `PATCH /api/tasks/:id/toggle` - Toggle task completion
- `DELETE /api/tasks/:id` - Delete task

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get specific category
- `POST /api/categories` - Create new category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category
- `GET /api/categories/:id/tasks` - Get tasks in category

### Habits
- `GET /api/habits` - Get all habits
- `GET /api/habits/:id` - Get specific habit
- `POST /api/habits/:id/complete` - Mark habit completion
- `GET /api/habits/:id/stats` - Get habit statistics
- `GET /api/habits/stats/overview` - Get overview statistics

## Database Schema

The application uses the following main tables:

- **`categories`**: Task categories with colors and styling
- **`tasks`**: Main task information
- **`time_blocks`**: Time scheduling for tasks
- **`habit_history`**: Daily habit completion tracking

## Development

### Backend Development
- The backend uses ES modules (`import/export`)
- Database queries use parameterized statements for security
- Comprehensive error handling and logging
- Rate limiting and security middleware included

### Frontend Development
- TypeScript for type safety
- Context API for global state management
- Responsive design with Tailwind CSS
- Component-based architecture

## Environment Variables

Create a `.env` file in the backend directory:

```env
# Database Configuration
DB_USER=postgre
DB_PASSWORD=Arun@$
DB_NAME=Task Flow
DB_HOST=localhost
DB_PORT=5432

# Server Configuration
PORT=5000
NODE_ENV=development
```

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Verify PostgreSQL is running
   - Check database credentials in `.env`
   - Ensure database "Task Flow" exists

2. **Port Already in Use**
   - Change the PORT in `.env` file
   - Kill processes using the port: `npx kill-port 5000`

3. **CORS Issues**
   - Verify frontend URL is in CORS configuration
   - Check if backend is running on correct port

### Database Issues

1. **Schema not created**
   - Run the `database/schema.sql` file manually in pgAdmin
   - Check PostgreSQL logs for errors

2. **UUID extension error**
   - Ensure PostgreSQL has the `uuid-ossp` extension
   - Run: `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support or questions, please open an issue in the repository.
