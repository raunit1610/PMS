import React, { useState, useEffect } from "react";
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import '../Styles/Diary.css';

import Header from "../../Home/Pages/Header";
import Button from "../../../Utility/Elements/Button";
import Input from "../../../Utility/Elements/Input";

const Diary = () => {
    const { id } = useParams();
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [userName, setUserName] = useState('');
    const [userId, setUserId] = useState('');
    const [entries, setEntries] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [currentEntry, setCurrentEntry] = useState(null);
    const [loading, setLoading] = useState(false);
    const [entry, setEntry] = useState({
        date: new Date().toISOString().split('T')[0],
        title: '',
        content: '',
        mood: 'neutral'
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
            fetchEntries();
        }
    }, [userId]);

    useEffect(() => {
        if (selectedDate && userId) {
            loadEntryForDate(selectedDate);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedDate, userId, entries]);

    const fetchEntries = async () => {
        if (!userId) return;
        setLoading(true);
        try {
            const response = await axios.get(`${API_BASE_URL}/feature/diary`, {
                params: { userId }
            });
            setEntries(response.data || []);
        } catch (error) {
            console.error('Error loading entries:', error);
            setEntries([]);
        } finally {
            setLoading(false);
        }
    };

    const loadEntryForDate = async (date) => {
        if (!userId) return;
        try {
            const entryForDate = entries.find(e => {
                const entryDate = new Date(e.date).toISOString().split('T')[0];
                return entryDate === date;
            });
            
            if (entryForDate) {
                setCurrentEntry(entryForDate);
                setEntry({
                    date: entryForDate.date ? new Date(entryForDate.date).toISOString().split('T')[0] : date,
                    title: entryForDate.title || '',
                    content: entryForDate.content || '',
                    mood: entryForDate.mood || 'neutral'
                });
            } else {
                setCurrentEntry(null);
                setEntry({
                    date: date,
                    title: '',
                    content: '',
                    mood: 'neutral'
                });
            }
        } catch (error) {
            console.error('Error loading entry:', error);
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
        setEntry(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSaveEntry = async (e) => {
        e.preventDefault();
        if (!entry.content.trim()) {
            alert('Please enter some content for your diary entry');
            return;
        }
        if (!userId) {
            alert('User ID is required');
            return;
        }

        try {
            if (currentEntry) {
                // Update existing entry
                await axios.put(`${API_BASE_URL}/feature/diary/${getId(currentEntry)}`, {
                    title: entry.title.trim(),
                    content: entry.content.trim(),
                    mood: entry.mood,
                    date: entry.date
                });
            } else {
                // Create new entry
                await axios.post(`${API_BASE_URL}/feature/diary`, {
                    userId,
                    date: entry.date,
                    title: entry.title.trim(),
                    content: entry.content.trim(),
                    mood: entry.mood
                });
            }
            await fetchEntries();
            await loadEntryForDate(entry.date);
            alert('Diary entry saved successfully!');
        } catch (error) {
            console.error('Error saving entry:', error);
            alert(error.response?.data?.message || 'Failed to save diary entry. Please try again.');
        }
    };

    const handleDeleteEntry = async () => {
        if (!currentEntry) return;
        if (window.confirm('Are you sure you want to delete this diary entry?')) {
            try {
                await axios.delete(`${API_BASE_URL}/feature/diary/${getId(currentEntry)}`);
                setCurrentEntry(null);
                setEntry({
                    date: selectedDate,
                    title: '',
                    content: '',
                    mood: 'neutral'
                });
                await fetchEntries();
            } catch (error) {
                console.error('Error deleting entry:', error);
                alert(error.response?.data?.message || 'Failed to delete entry.');
            }
        }
    };

    const handleDateChange = (newDate) => {
        setSelectedDate(newDate);
        loadEntryForDate(newDate);
    };

    const moods = [
        { value: 'happy', emoji: '😊', label: 'Happy' },
        { value: 'sad', emoji: '😢', label: 'Sad' },
        { value: 'excited', emoji: '🤩', label: 'Excited' },
        { value: 'anxious', emoji: '😰', label: 'Anxious' },
        { value: 'calm', emoji: '😌', label: 'Calm' },
        { value: 'angry', emoji: '😠', label: 'Angry' },
        { value: 'neutral', emoji: '😐', label: 'Neutral' }
    ];

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
                        <Link to={`/feature/Todo/${userId}`} className="sidebar-item" onClick={closeSidebar}>
                            <span className="sidebar-icon">📝</span>
                            <span className="sidebar-text">To-Do</span>
                        </Link>
                        <Link to={`/feature/Diary/${userId}`} className="sidebar-item active" onClick={closeSidebar}>
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
                    
                    <div className="diary-content">
                        <div className="diary-header">
                            <div className="diary-stats">
                                <div className="stat-card">
                                    <div className="stat-icon">📔</div>
                                    <div className="stat-info">
                                        <div className="stat-label">Total Entries</div>
                                        <div className="stat-value">{entries.length}</div>
                                    </div>
                                </div>
                            </div>
                            <div className="date-selector">
                                <label>Select Date:</label>
                                <Input
                                    type="date"
                                    class="date-input"
                                    value={selectedDate}
                                    onChange={(e) => handleDateChange(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="diary-editor">
                            <form onSubmit={handleSaveEntry}>
                                <div className="editor-header">
                                    <div className="form-group">
                                        <label>Title (Optional)</label>
                                        <Input
                                            type="text"
                                            name="title"
                                            class="form-input"
                                            holder="Give your entry a title..."
                                            value={entry.title}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Mood</label>
                                        <div className="mood-selector">
                                            {moods.map(mood => (
                                                <button
                                                    key={mood.value}
                                                    type="button"
                                                    className={`mood-option ${entry.mood === mood.value ? 'active' : ''}`}
                                                    onClick={() => setEntry(prev => ({ ...prev, mood: mood.value }))}
                                                    title={mood.label}
                                                >
                                                    <span className="mood-emoji">{mood.emoji}</span>
                                                    <span className="mood-label">{mood.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Your Story</label>
                                    <textarea
                                        name="content"
                                        className="diary-textarea"
                                        placeholder="Write your daily story here..."
                                        value={entry.content}
                                        onChange={handleInputChange}
                                        rows="15"
                                    />
                                </div>
                                <div className="editor-actions">
                                    <Button
                                        type="submit"
                                        class="save-btn"
                                        text={currentEntry ? "Update Entry" : "Save Entry"}
                                    />
                                    {currentEntry && (
                                        <Button
                                            type="button"
                                            class="delete-btn"
                                            text="Delete Entry"
                                            click={handleDeleteEntry}
                                        />
                                    )}
                                </div>
                            </form>
                        </div>

                        {entries.length > 0 && (
                            <div className="diary-entries-list">
                                <h3>Recent Entries</h3>
                                <div className="entries-grid">
                                    {entries.slice(0, 6).map(entryItem => {
                                        const entryId = getId(entryItem);
                                        const entryDate = new Date(entryItem.date).toLocaleDateString();
                                        return (
                                            <div
                                                key={entryId}
                                                className="entry-card"
                                                onClick={() => {
                                                    setSelectedDate(new Date(entryItem.date).toISOString().split('T')[0]);
                                                    loadEntryForDate(new Date(entryItem.date).toISOString().split('T')[0]);
                                                }}
                                            >
                                                <div className="entry-date">{entryDate}</div>
                                                {entryItem.title && (
                                                    <div className="entry-title">{entryItem.title}</div>
                                                )}
                                                <div className="entry-preview">
                                                    {entryItem.content.substring(0, 100)}
                                                    {entryItem.content.length > 100 && '...'}
                                                </div>
                                                <div className="entry-mood">
                                                    {moods.find(m => m.value === entryItem.mood)?.emoji || '😐'}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Diary;
