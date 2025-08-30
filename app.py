from flask import Flask, render_template, request, jsonify, redirect, url_for
from supabase import create_client, Client
import os
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)

# Supabase configuration
SUPABASE_URL = os.getenv("SUPABASE_URL", "your-supabase-url")
SUPABASE_KEY = os.getenv("SUPABASE_ANON_KEY", "your-supabase-anon-key")

# Initialize Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

@app.route('/')
def index():
    """Main page with user selection and task management"""
    try:
        # Fetch all users
        users_response = supabase.table('users').select('*').order('name').execute()
        users = users_response.data
        
        # Fetch all tasks with user information
        tasks_response = supabase.table('tasks').select('''
            *,
            users (
                id,
                name,
                email
            )
        ''').order('created_at', desc=True).execute()
        tasks = tasks_response.data
        
    except Exception as e:
        print(f"Error fetching data: {e}")
        users = []
        tasks = []
    
    return render_template('index.html', users=users, tasks=tasks)

@app.route('/register_user', methods=['POST'])
def register_user():
    """Register a new user"""
    try:
        name = request.form.get('name')
        email = request.form.get('email', '').strip()
        
        if not name:
            return jsonify({'error': 'Name is required'}), 400
        
        # Check if user already exists by name
        existing_user = supabase.table('users').select('*').eq('name', name).execute()
        if existing_user.data:
            return jsonify({'error': 'User with this name already exists'}), 400
        
        # Check if email already exists (if provided)
        if email:
            existing_email = supabase.table('users').select('*').eq('email', email).execute()
            if existing_email.data:
                return jsonify({'error': 'User with this email already exists'}), 400
        
        # Insert new user
        user_data = {'name': name}
        if email:
            user_data['email'] = email
            
        response = supabase.table('users').insert(user_data).execute()
        
        if response.data:
            return jsonify({'success': True, 'user': response.data[0]})
        else:
            return jsonify({'error': 'Failed to register user'}), 500
            
    except Exception as e:
        print(f"Error registering user: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/add_task', methods=['POST'])
def add_task():
    """Add a new task for a user"""
    try:
        user_id = request.form.get('user_id')
        title = request.form.get('title')
        description = request.form.get('description', '')
        priority = request.form.get('priority', 'medium')
        
        if not user_id or not title:
            return jsonify({'error': 'User and task title are required'}), 400
        
        # Verify user exists
        user_check = supabase.table('users').select('id').eq('id', user_id).execute()
        if not user_check.data:
            return jsonify({'error': 'User not found'}), 404
        
        # Insert task
        task_data = {
            'user_id': int(user_id),
            'title': title,
            'description': description,
            'priority': priority,
            'status': 'pending'
        }
        
        response = supabase.table('tasks').insert(task_data).execute()
        
        if response.data:
            return jsonify({'success': True, 'task': response.data[0]})
        else:
            return jsonify({'error': 'Failed to add task'}), 500
            
    except Exception as e:
        print(f"Error adding task: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/update_task_status', methods=['POST'])
def update_task_status():
    """Update task status"""
    try:
        task_id = request.form.get('task_id')
        status = request.form.get('status')
        
        if not task_id or not status:
            return jsonify({'error': 'Task ID and status are required'}), 400
        
        if status not in ['pending', 'in_progress', 'completed']:
            return jsonify({'error': 'Invalid status'}), 400
        
        response = supabase.table('tasks').update({
            'status': status,
            'updated_at': datetime.utcnow().isoformat()
        }).eq('id', task_id).execute()
        
        if response.data:
            return jsonify({'success': True, 'task': response.data[0]})
        else:
            return jsonify({'error': 'Failed to update task'}), 500
            
    except Exception as e:
        print(f"Error updating task: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/get_users')
def get_users():
    """Get all users as JSON"""
    try:
        response = supabase.table('users').select('*').order('name').execute()
        return jsonify(response.data)
    except Exception as e:
        print(f"Error fetching users: {e}")
        return jsonify([])

@app.route('/get_tasks')
def get_tasks():
    """Get all tasks with user information as JSON"""
    try:
        response = supabase.table('tasks').select('''
            *,
            users (
                id,
                name,
                email
            )
        ''').order('created_at', desc=True).execute()
        return jsonify(response.data)
    except Exception as e:
        print(f"Error fetching tasks: {e}")
        return jsonify([])

@app.route('/get_user_tasks/<int:user_id>')
def get_user_tasks(user_id):
    """Get tasks for a specific user"""
    try:
        response = supabase.table('tasks').select('''
            *,
            users (
                id,
                name,
                email
            )
        ''').eq('user_id', user_id).order('created_at', desc=True).execute()
        return jsonify(response.data)
    except Exception as e:
        print(f"Error fetching user tasks: {e}")
        return jsonify([])

@app.route('/delete_task/<int:task_id>', methods=['DELETE'])
def delete_task(task_id):
    """Delete a task"""
    try:
        response = supabase.table('tasks').delete().eq('id', task_id).execute()
        return jsonify({'success': True})
    except Exception as e:
        print(f"Error deleting task: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/delete_user/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    """Delete a user and all their tasks"""
    try:
        # Tasks will be automatically deleted due to CASCADE foreign key
        response = supabase.table('users').delete().eq('id', user_id).execute()
        return jsonify({'success': True})
    except Exception as e:
        print(f"Error deleting user: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    # For local development
    app.run(debug=True, host='0.0.0.0', port=int(os.environ.get('PORT', 5000)))

# For production deployment (Vercel, Railway, etc.)
# The app object is used directly by the hosting platform