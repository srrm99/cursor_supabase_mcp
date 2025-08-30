# Task Manager Pro Web App

A modern, responsive task management web application built with Flask and Supabase. Features a decoupled architecture with separate user management and task assignment capabilities.

## Features

### User Management
- 👥 **User Registration**: Register users with name and optional email
- 📋 **User Directory**: View all registered users with their details
- 🔍 **User Task Filtering**: View tasks specific to each user
- 🗑️ **User Deletion**: Remove users and their associated tasks

### Task Management
- ✅ **Task Creation**: Create tasks with title, description, and priority
- 🎯 **Task Assignment**: Assign tasks to specific users
- 📊 **Status Tracking**: Track task status (Pending, In Progress, Completed)
- 🚩 **Priority Levels**: Set task priority (Low, Medium, High)
- 🔄 **Status Updates**: Change task status with dropdown selection
- 📱 **Responsive Design**: Works perfectly on all devices

### Advanced Features
- 🎨 **Modern UI**: Beautiful gradient design with animations
- 🔍 **Advanced Filtering**: Filter tasks by status and priority
- ⚡ **Real-time Updates**: Auto-refresh every 30 seconds
- 🔔 **Notifications**: Success/error feedback for all actions
- ⌨️ **Keyboard Shortcuts**: Ctrl+Enter to submit, Escape to clear
- 📊 **Visual Priority**: Color-coded priority badges
- 🚀 **Fast Performance**: Optimized database queries with indexes

## Tech Stack

- **Backend**: Flask (Python)
- **Database**: Supabase (PostgreSQL)
- **Frontend**: HTML5, CSS3, JavaScript
- **Styling**: Custom CSS with modern design principles
- **Icons**: Font Awesome

## Setup Instructions

### 1. Prerequisites

- Python 3.7+
- A Supabase account and project

### 2. Clone and Install Dependencies

```bash
# Navigate to the project directory
cd app_supabase

# Install Python dependencies
pip install -r requirements.txt
```

### 3. Supabase Setup

1. Create a new project on [Supabase](https://supabase.com)
2. Go to the SQL Editor in your Supabase dashboard
3. Run the SQL script from `create_table.sql` to create the tasks table
4. Get your project URL and anon key from Settings > API

### 4. Environment Configuration

Create a `.env` file in the project root:

```env
SUPABASE_URL=your-supabase-project-url
SUPABASE_ANON_KEY=your-supabase-anon-key
```

Or set environment variables directly:

```bash
export SUPABASE_URL="your-supabase-project-url"
export SUPABASE_ANON_KEY="your-supabase-anon-key"
```

### 5. Run the Application

```bash
python app.py
```

The app will be available at `http://localhost:5000`

## Database Schema

### Users Table
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Tasks Table
```sql
CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
    priority VARCHAR(10) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## API Endpoints

### User Management
- `POST /register_user` - Register a new user
- `GET /get_users` - Get all users as JSON
- `DELETE /delete_user/<id>` - Delete a user and all their tasks

### Task Management
- `POST /add_task` - Add a new task for a user
- `POST /update_task_status` - Update task status
- `GET /get_tasks` - Get all tasks with user information as JSON
- `GET /get_user_tasks/<user_id>` - Get tasks for a specific user
- `DELETE /delete_task/<id>` - Delete a specific task

### Main Pages
- `GET /` - Main page with user registration, task creation, and management

## File Structure

```
app_supabase/
├── app.py                 # Flask application
├── requirements.txt       # Python dependencies
├── create_table.sql      # Database schema
├── config_template.txt   # Configuration guide
├── README.md            # This file
├── templates/
│   └── index.html       # Main HTML template
└── static/
    ├── style.css        # CSS styling
    └── script.js        # JavaScript functionality
```

## Features Explanation

### Frontend Features
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Real-time Updates**: Auto-refreshes every 30 seconds
- **Form Validation**: Client-side validation for better UX
- **Loading States**: Visual feedback during operations
- **Notifications**: Success/error messages for user actions
- **Keyboard Shortcuts**: Ctrl/Cmd+Enter to submit, Escape to clear

### Backend Features
- **RESTful API**: Clean API endpoints for all operations
- **Error Handling**: Comprehensive error handling and logging
- **Security**: Row Level Security (RLS) enabled on Supabase
- **Performance**: Optimized database queries with indexes

## Customization

### Styling
Edit `static/style.css` to customize the appearance. The CSS uses CSS custom properties for easy theming.

### Functionality
Modify `static/script.js` to add new features like task editing, categories, or priorities.

### Backend
Update `app.py` to add new endpoints or modify existing functionality.

## Security Notes

- The current setup allows anonymous access for simplicity
- In production, implement proper authentication and authorization
- Consider implementing rate limiting for API endpoints
- Validate and sanitize all user inputs

## Troubleshooting

### Common Issues

1. **Module not found errors**: Make sure all dependencies are installed with `pip install -r requirements.txt`
2. **Supabase connection errors**: Verify your SUPABASE_URL and SUPABASE_ANON_KEY are correct
3. **Table doesn't exist**: Run the SQL script from `create_table.sql` in your Supabase SQL editor
4. **CORS issues**: Ensure your Supabase project allows requests from your domain

### Development Mode

The app runs in debug mode by default. For production deployment:

```python
if __name__ == '__main__':
    app.run(debug=False, host='0.0.0.0', port=int(os.environ.get('PORT', 5000)))
```

## Contributing

Feel free to fork this project and submit pull requests for any improvements!

## License

This project is open source and available under the MIT License.
