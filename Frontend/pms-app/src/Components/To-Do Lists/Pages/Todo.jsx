import React, { useState, useEffect } from "react";
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import '../Styles/Todo.css';

import Header from "../../Home/Pages/Header";
import Button from "../../../Utility/Elements/Button";
import Input from "../../../Utility/Elements/Input";

const Todo = () => {
    const { id } = useParams();
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [userName, setUserName] = useState('');
    const [userId, setUserId] = useState('');
    const [todos, setTodos] = useState([]);
    const [newTodo, setNewTodo] = useState('');
    const [loading, setLoading] = useState(false);
    const [selectedColor, setSelectedColor] = useState('#ffd700');

    const colors = ['#ffd700', '#ff6b6b', '#4ecdc4', '#95e1d3', '#f38181', '#aa96da', '#fcbad3', '#a8e6cf'];

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
            fetchTodos();
        }
    }, [userId]);

    const fetchTodos = async () => {
        if (!userId) return;
        setLoading(true);
        try {
            const response = await axios.get(`${API_BASE_URL}/feature/todos`, {
                params: { userId }
            });
            setTodos(response.data || []);
        } catch (error) {
            console.error('Error loading todos:', error);
            setTodos([]);
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

    const handleAddTodo = async (e) => {
        e.preventDefault();
        if (!newTodo.trim()) {
            alert('Please enter a todo item');
            return;
        }
        if (!userId) {
            alert('User ID is required');
            return;
        }

        try {
            await axios.post(`${API_BASE_URL}/feature/todos`, {
                userId,
                content: newTodo.trim(),
                color: selectedColor
            });
            setNewTodo('');
            fetchTodos();
        } catch (error) {
            console.error('Error adding todo:', error);
            alert(error.response?.data?.message || 'Failed to add todo. Please try again.');
        }
    };

    const handleToggleComplete = async (todoId) => {
        const todo = todos.find(t => getId(t) === todoId);
        if (!todo) return;
        const newStatus = !todo.isCompleted;
        
        try {
            await axios.put(`${API_BASE_URL}/feature/todos/${todoId}`, {
                isCompleted: newStatus
            });
            fetchTodos();
        } catch (error) {
            console.error('Error updating todo:', error);
            alert(error.response?.data?.message || 'Failed to update todo.');
        }
    };

    const handleDeleteTodo = async (todoId) => {
        try {
            await axios.delete(`${API_BASE_URL}/feature/todos/${todoId}`);
            fetchTodos();
        } catch (error) {
            console.error('Error deleting todo:', error);
            alert(error.response?.data?.message || 'Failed to delete todo.');
        }
    };

    const handleUpdateTodo = async (todoId, newContent) => {
        if (!newContent.trim()) {
            alert('Todo cannot be empty');
            return;
        }
        try {
            await axios.put(`${API_BASE_URL}/feature/todos/${todoId}`, {
                content: newContent.trim()
            });
            fetchTodos();
        } catch (error) {
            console.error('Error updating todo:', error);
            alert(error.response?.data?.message || 'Failed to update todo.');
        }
    };

    const completedTodos = todos.filter(t => t.isCompleted).length;
    const pendingTodos = todos.filter(t => !t.isCompleted).length;

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
                        <Link to={`/feature/Tasks/${userId}`} className="sidebar-item" onClick={closeSidebar}>
                            <span className="sidebar-icon">✅</span>
                            <span className="sidebar-text">Tasks</span>
                        </Link>
                        <Link to={`/feature/Todo/${userId}`} className="sidebar-item active" onClick={closeSidebar}>
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
                    
                    <div className="todo-content">
                        <div className="todo-stats">
                            <div className="stat-card">
                                <div className="stat-icon">📝</div>
                                <div className="stat-info">
                                    <div className="stat-label">Total Todos</div>
                                    <div className="stat-value">{todos.length}</div>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon">⏳</div>
                                <div className="stat-info">
                                    <div className="stat-label">Pending</div>
                                    <div className="stat-value">{pendingTodos}</div>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon">✅</div>
                                <div className="stat-info">
                                    <div className="stat-label">Completed</div>
                                    <div className="stat-value">{completedTodos}</div>
                                </div>
                            </div>
                        </div>

                        <div className="todo-add-form">
                            <form onSubmit={handleAddTodo}>
                                <div className="form-row">
                                    <Input
                                        type="text"
                                        class="todo-input"
                                        holder="Add a new todo..."
                                        value={newTodo}
                                        onChange={(e) => setNewTodo(e.target.value)}
                                    />
                                    <div className="color-picker">
                                        {colors.map(color => (
                                            <button
                                                key={color}
                                                type="button"
                                                className={`color-option ${selectedColor === color ? 'active' : ''}`}
                                                style={{ backgroundColor: color }}
                                                onClick={() => setSelectedColor(color)}
                                                title={`Select ${color}`}
                                            />
                                        ))}
                                    </div>
                                    <Button
                                        type="submit"
                                        class="add-todo-btn"
                                        text="Add"
                                    />
                                </div>
                            </form>
                        </div>

                        <div className="todo-board">
                            {loading ? (
                                <div className="loading-state">Loading todos...</div>
                            ) : todos.length === 0 ? (
                                <div className="empty-state">
                                    <div className="empty-icon">📝</div>
                                    <h3>No todos yet</h3>
                                    <p>Create your first sticky note todo to get started!</p>
                                </div>
                            ) : (
                                <div className="sticky-notes-grid">
                                    {todos.map(todo => {
                                        const todoId = getId(todo);
                                        return (
                                            <StickyNote
                                                key={todoId}
                                                todo={todo}
                                                onToggleComplete={() => handleToggleComplete(todoId)}
                                                onDelete={() => handleDeleteTodo(todoId)}
                                                onUpdate={(newContent) => handleUpdateTodo(todoId, newContent)}
                                            />
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const StickyNote = ({ todo, onToggleComplete, onDelete, onUpdate }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(todo.content);

    const handleSave = () => {
        if (editContent.trim() && editContent !== todo.content) {
            onUpdate(editContent);
        }
        setIsEditing(false);
    };

    const handleCancel = () => {
        setEditContent(todo.content);
        setIsEditing(false);
    };

    return (
        <div 
            className={`sticky-note ${todo.isCompleted ? 'completed' : ''}`}
            style={{ backgroundColor: todo.color || '#ffd700' }}
        >
            <div className="sticky-note-header">
                <input
                    type="checkbox"
                    checked={todo.isCompleted}
                    onChange={onToggleComplete}
                    className="sticky-checkbox"
                />
                <button
                    className="sticky-delete-btn"
                    onClick={onDelete}
                    title="Delete"
                >
                    🗑️
                </button>
            </div>
            <div className="sticky-note-content">
                {isEditing ? (
                    <div className="sticky-edit">
                        <textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className="sticky-edit-input"
                            autoFocus
                            onBlur={handleSave}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && e.ctrlKey) {
                                    handleSave();
                                } else if (e.key === 'Escape') {
                                    handleCancel();
                                }
                            }}
                        />
                        <div className="sticky-edit-hint">Ctrl+Enter to save, Esc to cancel</div>
                    </div>
                ) : (
                    <div
                        className="sticky-text"
                        onClick={() => setIsEditing(true)}
                        title="Click to edit"
                    >
                        {todo.content}
                    </div>
                )}
            </div>
            {todo.isCompleted && (
                <div className="sticky-completed-badge">✓ Completed</div>
            )}
        </div>
    );
};

export default Todo;
