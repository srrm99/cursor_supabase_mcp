// DOM Elements
const userForm = document.getElementById('userForm');
const taskForm = document.getElementById('taskForm');
const usersList = document.getElementById('usersList');
const tasksList = document.getElementById('tasksList');
const refreshUsersBtn = document.getElementById('refreshUsersBtn');
const refreshTasksBtn = document.getElementById('refreshTasksBtn');
const notification = document.getElementById('notification');
const statusFilter = document.getElementById('statusFilter');
const priorityFilter = document.getElementById('priorityFilter');
const userTasksModal = document.getElementById('userTasksModal');

// Show notification
function showNotification(message, type = 'success') {
    notification.textContent = message;
    notification.className = `notification ${type} show`;
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// Format date for display
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}

// Create user card HTML
function createUserCard(user) {
    return `
        <div class="user-card" data-user-id="${user.id}">
            <div class="user-info">
                <div class="user-avatar">
                    <i class="fas fa-user-circle"></i>
                </div>
                <div class="user-details">
                    <h3>${escapeHtml(user.name)}</h3>
                    ${user.email ? `<p class="user-email">${escapeHtml(user.email)}</p>` : ''}
                    <p class="user-joined">Joined: ${formatDate(user.created_at)}</p>
                </div>
            </div>
            <div class="user-actions">
                <button class="view-tasks-btn" onclick="showUserTasks(${user.id}, '${escapeHtml(user.name)}')">
                    <i class="fas fa-tasks"></i> View Tasks
                </button>
                <button class="delete-user-btn" onclick="deleteUser(${user.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `;
}

// Create task card HTML
function createTaskCard(task) {
    return `
        <div class="task-card priority-${task.priority} status-${task.status}" data-task-id="${task.id}">
            <div class="task-header">
                <div class="task-priority">
                    <span class="priority-badge priority-${task.priority}">
                        <i class="fas fa-flag"></i> ${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                    </span>
                </div>
                <div class="task-status">
                    <select class="status-select" onchange="updateTaskStatus(${task.id}, this.value)">
                        <option value="pending" ${task.status === 'pending' ? 'selected' : ''}>Pending</option>
                        <option value="in_progress" ${task.status === 'in_progress' ? 'selected' : ''}>In Progress</option>
                        <option value="completed" ${task.status === 'completed' ? 'selected' : ''}>Completed</option>
                    </select>
                </div>
            </div>
            
            <div class="task-content">
                <h3 class="task-title">${escapeHtml(task.title)}</h3>
                ${task.description ? `<p class="task-description">${escapeHtml(task.description)}</p>` : ''}
            </div>
            
            <div class="task-footer">
                <div class="task-user">
                    <i class="fas fa-user"></i>
                    <strong>${escapeHtml(task.users.name)}</strong>
                </div>
                <div class="task-date">
                    <i class="fas fa-calendar"></i>
                    ${formatDate(task.created_at)}
                </div>
                <button class="delete-task-btn" onclick="deleteTask(${task.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `;
}

// Load users from server
async function loadUsers() {
    try {
        const response = await fetch('/get_users');
        const users = await response.json();
        
        const userSelect = document.getElementById('taskUser');
        userSelect.innerHTML = '<option value="">Select a user...</option>';
        
        if (users.length === 0) {
            usersList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-user-friends"></i>
                    <p>No users registered yet. Add a user above to get started!</p>
                </div>
            `;
        } else {
            usersList.innerHTML = users.map(createUserCard).join('');
            
            // Update user select dropdown
            users.forEach(user => {
                const option = document.createElement('option');
                option.value = user.id;
                option.textContent = user.name;
                userSelect.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error loading users:', error);
        showNotification('Error loading users', 'error');
    }
}

// Load tasks from server
async function loadTasks() {
    try {
        const response = await fetch('/get_tasks');
        const allTasks = await response.json();
        
        // Apply filters
        const statusFilterValue = statusFilter.value;
        const priorityFilterValue = priorityFilter.value;
        
        let filteredTasks = allTasks;
        if (statusFilterValue) {
            filteredTasks = filteredTasks.filter(task => task.status === statusFilterValue);
        }
        if (priorityFilterValue) {
            filteredTasks = filteredTasks.filter(task => task.priority === priorityFilterValue);
        }
        
        if (filteredTasks.length === 0) {
            tasksList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-clipboard-list"></i>
                    <p>No tasks found. ${allTasks.length > filteredTasks.length ? 'Try adjusting your filters or' : ''} Add a task above to get started!</p>
                </div>
            `;
        } else {
            tasksList.innerHTML = filteredTasks.map(createTaskCard).join('');
        }
    } catch (error) {
        console.error('Error loading tasks:', error);
        showNotification('Error loading tasks', 'error');
    }
}

// Register new user
async function registerUser(formData) {
    try {
        const response = await fetch('/register_user', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (response.ok && result.success) {
            showNotification('User registered successfully!');
            userForm.reset();
            loadUsers();
        } else {
            showNotification(result.error || 'Error registering user', 'error');
        }
    } catch (error) {
        console.error('Error registering user:', error);
        showNotification('Error registering user', 'error');
    }
}

// Add new task
async function addTask(formData) {
    try {
        const response = await fetch('/add_task', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (response.ok && result.success) {
            showNotification('Task added successfully!');
            taskForm.reset();
            loadTasks();
        } else {
            showNotification(result.error || 'Error adding task', 'error');
        }
    } catch (error) {
        console.error('Error adding task:', error);
        showNotification('Error adding task', 'error');
    }
}

// Update task status
async function updateTaskStatus(taskId, status) {
    try {
        const formData = new FormData();
        formData.append('task_id', taskId);
        formData.append('status', status);
        
        const response = await fetch('/update_task_status', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (response.ok && result.success) {
            showNotification('Task status updated!');
            loadTasks();
        } else {
            showNotification(result.error || 'Error updating task', 'error');
        }
    } catch (error) {
        console.error('Error updating task:', error);
        showNotification('Error updating task', 'error');
    }
}

// Delete task
async function deleteTask(taskId) {
    if (!confirm('Are you sure you want to delete this task?')) {
        return;
    }
    
    try {
        const response = await fetch(`/delete_task/${taskId}`, {
            method: 'DELETE'
        });
        
        const result = await response.json();
        
        if (response.ok && result.success) {
            showNotification('Task deleted successfully!');
            loadTasks();
        } else {
            showNotification(result.error || 'Error deleting task', 'error');
        }
    } catch (error) {
        console.error('Error deleting task:', error);
        showNotification('Error deleting task', 'error');
    }
}

// Delete user
async function deleteUser(userId) {
    if (!confirm('Are you sure you want to delete this user? This will also delete all their tasks.')) {
        return;
    }
    
    try {
        const response = await fetch(`/delete_user/${userId}`, {
            method: 'DELETE'
        });
        
        const result = await response.json();
        
        if (response.ok && result.success) {
            showNotification('User deleted successfully!');
            loadUsers();
            loadTasks();
        } else {
            showNotification(result.error || 'Error deleting user', 'error');
        }
    } catch (error) {
        console.error('Error deleting user:', error);
        showNotification('Error deleting user', 'error');
    }
}

// Show user tasks in modal
async function showUserTasks(userId, userName) {
    try {
        const response = await fetch(`/get_user_tasks/${userId}`);
        const tasks = await response.json();
        
        const modalTitle = document.getElementById('modalTitle');
        const modalTasksList = document.getElementById('modalTasksList');
        
        modalTitle.textContent = `Tasks for ${userName}`;
        
        if (tasks.length === 0) {
            modalTasksList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-clipboard-list"></i>
                    <p>No tasks assigned to this user yet.</p>
                </div>
            `;
        } else {
            modalTasksList.innerHTML = tasks.map(createTaskCard).join('');
        }
        
        userTasksModal.style.display = 'block';
    } catch (error) {
        console.error('Error loading user tasks:', error);
        showNotification('Error loading user tasks', 'error');
    }
}

// Close modal
function closeModal() {
    userTasksModal.style.display = 'none';
}

// Form submission handlers
userForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(userForm);
    const submitBtn = userForm.querySelector('.submit-btn');
    
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;
    
    try {
        await registerUser(formData);
    } finally {
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
    }
});

taskForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(taskForm);
    const submitBtn = taskForm.querySelector('.submit-btn');
    
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;
    
    try {
        await addTask(formData);
    } finally {
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
    }
});

// Refresh button handlers
refreshUsersBtn.addEventListener('click', () => {
    refreshUsersBtn.style.transform = 'rotate(360deg)';
    loadUsers();
    
    setTimeout(() => {
        refreshUsersBtn.style.transform = '';
    }, 300);
});

refreshTasksBtn.addEventListener('click', () => {
    refreshTasksBtn.style.transform = 'rotate(360deg)';
    loadTasks();
    
    setTimeout(() => {
        refreshTasksBtn.style.transform = '';
    }, 300);
});

// Filter handlers
statusFilter.addEventListener('change', loadTasks);
priorityFilter.addEventListener('change', loadTasks);

// Modal click handler
userTasksModal.addEventListener('click', (e) => {
    if (e.target === userTasksModal) {
        closeModal();
    }
});

// Auto-refresh data every 30 seconds
setInterval(() => {
    loadUsers();
    loadTasks();
}, 30000);

// Form validation
const nameInput = document.getElementById('userName');
const emailInput = document.getElementById('userEmail');
const taskTitleInput = document.getElementById('taskTitle');

nameInput.addEventListener('input', () => {
    if (nameInput.value.trim().length < 2) {
        nameInput.setCustomValidity('Name must be at least 2 characters long');
    } else {
        nameInput.setCustomValidity('');
    }
});

emailInput.addEventListener('input', () => {
    if (emailInput.value && !emailInput.value.includes('@')) {
        emailInput.setCustomValidity('Please enter a valid email address');
    } else {
        emailInput.setCustomValidity('');
    }
});

taskTitleInput.addEventListener('input', () => {
    if (taskTitleInput.value.trim().length < 3) {
        taskTitleInput.setCustomValidity('Task title must be at least 3 characters long');
    } else {
        taskTitleInput.setCustomValidity('');
    }
});

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    loadUsers();
    loadTasks();
    
    // Add animations
    const cards = document.querySelectorAll('.user-card, .task-card');
    cards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
    });
});

// Handle offline/online status
window.addEventListener('online', () => {
    showNotification('Connection restored', 'success');
    loadUsers();
    loadTasks();
});

window.addEventListener('offline', () => {
    showNotification('You are offline', 'error');
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + Enter to submit active form
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        const activeElement = document.activeElement;
        if (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA' || activeElement.tagName === 'SELECT') {
            const form = activeElement.closest('form');
            if (form) {
                form.dispatchEvent(new Event('submit'));
            }
        }
    }
    
    // Escape to clear forms or close modal
    if (e.key === 'Escape') {
        if (userTasksModal.style.display === 'block') {
            closeModal();
        } else {
            userForm.reset();
            taskForm.reset();
        }
    }
});