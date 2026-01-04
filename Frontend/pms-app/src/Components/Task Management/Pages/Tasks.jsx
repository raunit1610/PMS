import React, { useState, useEffect } from "react";
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import '../Styles/Tasks.css';

import Header from "../../Home/Pages/Header";
import Button from "../../../Utility/Elements/Button";
import Input from "../../../Utility/Elements/Input";

const Tasks = () => {
    const { id } = useParams();
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [userName, setUserName] = useState('');
    const [userId, setUserId] = useState('');
    const [tasks, setTasks] = useState([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterPriority, setFilterPriority] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [newTask, setNewTask] = useState({
        title: '',
        description: '',
        dueDate: '',
        status: 'pending'
    });

    useEffect(() => {
        const checkScreenSize = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            if (!mobile) {
                setSidebarOpen(false);
            }
        };
        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);
        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);

    useEffect(() => {
        try {
            const storedName = localStorage.getItem('userName') || '';
            const storedId = localStorage.getItem('userId') || '';
            setUserName(storedName);
            setUserId(storedId);
        } catch (error) {
            setUserName('');
            setUserId('');
        }
    }, []);

    useEffect(() => {
        if (userId) {
            fetchTasks();
        }
    }, [userId]);

    const fetchTasks = async () => {
        if (!userId) return;
        setLoading(true);
        try {
            const response = await axios.get(`${API_BASE_URL}/feature/tasks`, {
                params: { userId }
            });
            setTasks(response.data || []);
        } catch (error) {
            console.error('Error loading tasks:', error);
            setTasks([]);
        } finally {
            setLoading(false);
        }
    };

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    const closeSidebar = () => {
        setSidebarOpen(false);
    };

    useEffect(() => {
        setSidebarOpen(false);
    }, [id]);

    const getId = (item) => item?._id || item?.id;

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewTask(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleAddTask = async (e) => {
        e.preventDefault();
        if (!newTask.title.trim() || !newTask.dueDate) {
            alert('Please fill in title and due date');
            return;
        }
        if (!userId) {
            alert('User ID is required');
            return;
        }

        try {
            await axios.post(`${API_BASE_URL}/feature/tasks`, {
                userId,
                title: newTask.title.trim(),
                description: newTask.description.trim() || '',
                dueDate: newTask.dueDate,
                status: newTask.status || 'pending'
            });
            setNewTask({
                title: '',
                description: '',
                dueDate: '',
                status: 'pending'
            });
            setShowAddForm(false);
            fetchTasks();
        } catch (error) {
            console.error('Error adding task:', error);
            alert(error.response?.data?.message || 'Failed to add task. Please try again.');
        }
    };

    const handleEditTask = (task) => {
        setEditingTask(task);
        setNewTask({
            title: task.title,
            description: task.description || '',
            dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
            status: task.status
        });
        setShowAddForm(true);
    };

    const handleUpdateTask = async (e) => {
        e.preventDefault();
        if (!editingTask) return;
        if (!newTask.title.trim() || !newTask.dueDate) {
            alert('Please fill in title and due date');
            return;
        }

        try {
            await axios.put(`${API_BASE_URL}/feature/tasks/${getId(editingTask)}`, {
                title: newTask.title.trim(),
                description: newTask.description.trim() || '',
                dueDate: newTask.dueDate,
                status: newTask.status
            });
            setEditingTask(null);
            setNewTask({
                title: '',
                description: '',
                dueDate: '',
                status: 'pending'
            });
            setShowAddForm(false);
            fetchTasks();
        } catch (error) {
            console.error('Error updating task:', error);
            alert(error.response?.data?.message || 'Failed to update task. Please try again.');
        }
    };

    const handleToggleComplete = async (taskId) => {
        const task = tasks.find(t => getId(t) === taskId);
        if (!task) return;
        const newStatus = task.status === 'completed' ? 'pending' : 'completed';
        
        try {
            await axios.put(`${API_BASE_URL}/feature/tasks/${taskId}`, {
                status: newStatus
            });
            fetchTasks();
        } catch (error) {
            console.error('Error updating task status:', error);
            alert(error.response?.data?.message || 'Failed to update task status.');
        }
    };

    const handleDeleteAllTasks = async () => {
        if (window.confirm('Are you sure you want to delete ALL tasks? This action cannot be undone.')) {
            try {
                await axios.delete(`${API_BASE_URL}/feature/tasks/delete-all`, {
                    params: { userId }
                });
                fetchTasks();
                alert('All tasks deleted successfully!');
            } catch (error) {
                console.error('Error deleting all tasks:', error);
                alert(error.response?.data?.message || 'Failed to delete all tasks. Please try again.');
            }
        }
    };

    const handleDeleteTask = async (taskId) => {
        if (window.confirm('Are you sure you want to delete this task?')) {
            try {
                await axios.delete(`${API_BASE_URL}/feature/tasks/${taskId}`);
                fetchTasks();
            } catch (error) {
                console.error('Error deleting task:', error);
                alert(error.response?.data?.message || 'Failed to delete task.');
            }
        }
    };

    const calculateDaysUntilDue = (dueDate) => {
        const now = new Date();
        const due = new Date(dueDate);
        const diffTime = due - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const filteredTasks = tasks.filter(task => {
        const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
        const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
        const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                             (task.description || '').toLowerCase().includes(searchQuery.toLowerCase());
        return matchesStatus && matchesPriority && matchesSearch;
    });

    // Sort tasks by priority (urgent > high > medium > low) and then by due date
    const sortedTasks = [...filteredTasks].sort((a, b) => {
        const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
        const priorityDiff = (priorityOrder[a.priority] || 3) - (priorityOrder[b.priority] || 3);
        if (priorityDiff !== 0) return priorityDiff;
        return new Date(a.dueDate) - new Date(b.dueDate);
    });

    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const pendingTasks = tasks.filter(t => t.status === 'pending').length;
    const inProgressTasks = tasks.filter(t => t.status === 'in-progress').length;

    return (
        <div className="home-container">
            {isMobile && (
                <button 
                    className="mobile-menu-toggle" 
                    onClick={toggleSidebar}
                    aria-label="Toggle menu"
                >
                    ☰
                </button>
            )}

            {isMobile && (
                <div 
                    className={`sidebar ${sidebarOpen ? 'active' : ''}`}
                    onClick={(e) => {
                        if (e.target === e.currentTarget) closeSidebar();
                    }}
                    style={{ pointerEvents: sidebarOpen ? 'auto' : 'none' }}
                ></div>
            )}

            <div className="home-layout">
                <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
                    <div className="sidebar-logo">PMS</div>
                    <nav className="sidebar-nav">
                        <Link to={`/feature/home/${userId}`} className="sidebar-item" onClick={closeSidebar}>
                            <span className="sidebar-icon">🏠</span>
                            <span className="sidebar-text">Home</span>
                        </Link>
                        <Link to={`/feature/money/${userId}`} className="sidebar-item" onClick={closeSidebar}>
                            <span className="sidebar-icon">💰</span>
                            <span className="sidebar-text">Money</span>
                        </Link>
                        <Link to={`/feature/Tasks/${userId}`} className="sidebar-item active" onClick={closeSidebar}>
                            <span className="sidebar-icon">✅</span>
                            <span className="sidebar-text">Tasks</span>
                        </Link>
                        <Link to={`/feature/Todo/${userId}`} className="sidebar-item" onClick={closeSidebar}>
                            <span className="sidebar-icon">📝</span>
                            <span className="sidebar-text">To-Do</span>
                        </Link>
                        <Link to={`/feature/Diary/${userId}`} className="sidebar-item" onClick={closeSidebar}>
                            <span className="sidebar-icon">📔</span>
                            <span className="sidebar-text">Diary</span>
                        </Link>
                        <Link to={`/feature/Vault/${userId}`} className="sidebar-item" onClick={closeSidebar}>
                            <span className="sidebar-icon">🔐</span>
                            <span className="sidebar-text">Vault</span>
                        </Link>
                    </nav>
                    <div className="sidebar-menu" onClick={closeSidebar}>☰</div>
                </div>

                <div className="home-content">
                    <Header userName={userName} />
                    
                    <div className="tasks-content">
                        <div className="tasks-stats">
                            <div className="stat-card stat-card-total">
                                <div className="stat-icon">📋</div>
                                <div className="stat-info">
                                    <div className="stat-label">Total Tasks</div>
                                    <div className="stat-value">{tasks.length}</div>
                                </div>
                            </div>
                            <div className="stat-card stat-card-pending">
                                <div className="stat-icon">⏳</div>
                                <div className="stat-info">
                                    <div className="stat-label">Pending</div>
                                    <div className="stat-value">{pendingTasks}</div>
                                </div>
                            </div>
                            <div className="stat-card stat-card-progress">
                                <div className="stat-icon">🔄</div>
                                <div className="stat-info">
                                    <div className="stat-label">In Progress</div>
                                    <div className="stat-value">{inProgressTasks}</div>
                                </div>
                            </div>
                            <div className="stat-card stat-card-completed">
                                <div className="stat-icon">✅</div>
                                <div className="stat-info">
                                    <div className="stat-label">Completed</div>
                                    <div className="stat-value">{completedTasks}</div>
                                </div>
                            </div>
                        </div>

                        <div className="tasks-actions">
                            <div className="search-filter-bar">
                                <Input
                                    type="text"
                                    class="search-input"
                                    holder="Search tasks..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                <select
                                    className="filter-select"
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                >
                                    <option value="all">All Status</option>
                                    <option value="pending">Pending</option>
                                    <option value="in-progress">In Progress</option>
                                    <option value="completed">Completed</option>
                                </select>
                                <select
                                    className="filter-select"
                                    value={filterPriority}
                                    onChange={(e) => setFilterPriority(e.target.value)}
                                >
                                    <option value="all">All Priority</option>
                                    <option value="urgent">Urgent</option>
                                    <option value="high">High</option>
                                    <option value="medium">Medium</option>
                                    <option value="low">Low</option>
                                </select>
                            </div>
                            <div className="action-buttons-group">
                                <Button
                                    class="add-task-btn"
                                    text={showAddForm ? "Cancel" : "+ Add Task"}
                                    click={() => {
                                        setShowAddForm(!showAddForm);
                                        setEditingTask(null);
                                        setNewTask({
                                            title: '',
                                            description: '',
                                            dueDate: '',
                                            status: 'pending'
                                        });
                                    }}
                                />
                                {tasks.length > 0 && (
                                    <Button
                                        class="delete-all-btn"
                                        text="Delete All Tasks"
                                        click={handleDeleteAllTasks}
                                    />
                                )}
                            </div>
                        </div>

                        {showAddForm && (
                            <div className="add-task-form">
                                <h3>{editingTask ? 'Edit Task' : 'Add New Task'}</h3>
                                <form onSubmit={editingTask ? handleUpdateTask : handleAddTask}>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Task Title *</label>
                                            <Input
                                                type="text"
                                                name="title"
                                                class="form-input"
                                                holder="Enter task title"
                                                value={newTask.title}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Due Date *</label>
                                            <Input
                                                type="date"
                                                name="dueDate"
                                                class="form-input"
                                                value={newTask.dueDate}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Status</label>
                                            <select
                                                name="status"
                                                className="form-input"
                                                value={newTask.status}
                                                onChange={handleInputChange}
                                            >
                                                <option value="pending">Pending</option>
                                                <option value="in-progress">In Progress</option>
                                                <option value="completed">Completed</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label>Description</label>
                                        <textarea
                                            name="description"
                                            className="form-input form-textarea"
                                            placeholder="Enter task description"
                                            value={newTask.description}
                                            onChange={handleInputChange}
                                            rows="3"
                                        />
                                    </div>
                                    <div className="form-actions">
                                        <Button
                                            type="submit"
                                            class="submit-btn"
                                            text={editingTask ? "Update Task" : "Add Task"}
                                        />
                                        <Button
                                            type="button"
                                            class="cancel-btn"
                                            text="Cancel"
                                            click={() => {
                                                setShowAddForm(false);
                                                setEditingTask(null);
                                                setNewTask({
                                                    title: '',
                                                    description: '',
                                                    dueDate: '',
                                                    status: 'pending'
                                                });
                                            }}
                                        />
                                    </div>
                                </form>
                            </div>
                        )}

                        <div className="tasks-list">
                            {loading ? (
                                <div className="loading-state">Loading tasks...</div>
                            ) : sortedTasks.length === 0 ? (
                                <div className="empty-state">
                                    <div className="empty-icon">📋</div>
                                    <h3>No tasks found</h3>
                                    <p>{tasks.length === 0 ? 'Create your first task to get started!' : 'Try adjusting your filters or search query.'}</p>
                                </div>
                            ) : (
                                sortedTasks.map(task => {
                                    const taskId = getId(task);
                                    const daysUntil = calculateDaysUntilDue(task.dueDate);
                                    return (
                                        <div key={taskId} className={`task-card ${task.status} priority-${task.priority}`}>
                                            <div className="task-header">
                                                <div className="task-checkbox">
                                                    <input
                                                        type="checkbox"
                                                        checked={task.status === 'completed'}
                                                        onChange={() => handleToggleComplete(taskId)}
                                                    />
                                                </div>
                                                <div className="task-title-section">
                                                    <h4>{task.title}</h4>
                                                    <div className="task-meta">
                                                        <span className={`priority-badge priority-${task.priority}`}>
                                                            {task.priority}
                                                        </span>
                                                        <span className={`status-badge status-${task.status}`}>
                                                            {task.status}
                                                        </span>
                                                        <span className={`due-date ${daysUntil < 0 ? 'overdue' : daysUntil === 0 ? 'due-today' : ''}`}>
                                                            📅 {new Date(task.dueDate).toLocaleDateString()} 
                                                            {daysUntil < 0 && ` (${Math.abs(daysUntil)} days overdue)`}
                                                            {daysUntil === 0 && ' (Due today!)'}
                                                            {daysUntil > 0 && ` (${daysUntil} days left)`}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            {task.description && (
                                                <div className="task-description">
                                                    {task.description}
                                                </div>
                                            )}
                                            <div className="task-actions">
                                                <button
                                                    className="action-btn edit-btn"
                                                    onClick={() => handleEditTask(task)}
                                                    title="Edit task"
                                                >
                                                    ✏️
                                                </button>
                                                <button
                                                    className="action-btn delete-btn"
                                                    onClick={() => handleDeleteTask(taskId)}
                                                    title="Delete task"
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Tasks;
