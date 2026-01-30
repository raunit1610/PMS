import React, { useState, useEffect } from "react";
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import '../Styles/Home.css';

import Header from "./Header"

const Home = () => {
    const { id } = useParams();
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [userName, setUserName] = useState('');
    const [userId, setUserId] = useState('');
    const [dashboardData, setDashboardData] = useState({
        tasks: { total: 0, pending: 0, completed: 0, inProgress: 0 },
        todos: { total: 0, pending: 0, completed: 0 },
        diary: { total: 0 },
        vaults: { total: 0, items: 0 },
        money: { 
            total: 0, 
            pending: 0, 
            completed: 0,
            totalAmount: 0,
            monthlyExpense: 0,
            monthlyIncome: 0,
            monthlyOthers: 0,
            expenses: [],
            income: []
        }
    });
    const [loading, setLoading] = useState(true);
    const [hideAmounts, setHideAmounts] = useState({
        totalBalance: true,
        monthlyIncome: true,
        monthlyExpense: true,
        netSavings: true
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
            fetchDashboardData();
        }
    }, [userId]);

    const fetchDashboardData = async () => {
        if (!userId) return;
        setLoading(true);
        try {
            const [tasksRes, todosRes, diaryRes, vaultsRes, moneyRes, bankRes] = await Promise.allSettled([
                axios.get(`${API_BASE_URL}/feature/tasks`, { params: { userId } }),
                axios.get(`${API_BASE_URL}/feature/todos`, { params: { userId } }),
                axios.get(`${API_BASE_URL}/feature/diary`, { params: { userId } }),
                axios.get(`${API_BASE_URL}/feature/vaults`, { params: { userId } }),
                axios.get(`${API_BASE_URL}/feature/money/money`, { params: { userId } }),
                axios.get(`${API_BASE_URL}/feature/money/bank`, { params: { userId } })
            ]);

            const tasks = tasksRes.status === 'fulfilled' ? (tasksRes.value.data || []) : [];
            const todos = todosRes.status === 'fulfilled' ? (todosRes.value.data || []) : [];
            const diary = diaryRes.status === 'fulfilled' ? (diaryRes.value.data || []) : [];
            const vaults = vaultsRes.status === 'fulfilled' ? (vaultsRes.value.data || []) : [];
            const money = moneyRes.status === 'fulfilled' ? (moneyRes.value.data || []) : [];
            const banks = bankRes.status === 'fulfilled' ? (bankRes.value.data || []) : [];

            // Get vault items count
            let vaultItemsCount = 0;
            for (const vault of vaults) {
                try {
                    const itemsRes = await axios.get(`${API_BASE_URL}/feature/vaults/${vault._id}/items`);
                    vaultItemsCount += (itemsRes.data || []).length;
                } catch (err) {
                    console.error('Error fetching vault items:', err);
                }
            }

            // Calculate monthly expenses and income
            const now = new Date();
            const currentMonth = now.getMonth();
            const currentYear = now.getFullYear();
            
            const monthlyExpenses = money
                .filter(m => {
                    if (m.category === 'income' || m.status !== 'completed') return false;
                    const taskDate = new Date(m.dueDate || Date.now());
                    return taskDate.getMonth() === currentMonth && 
                           taskDate.getFullYear() === currentYear;
                })
                .reduce((sum, m) => sum + (m.amount || 0), 0);

            const monthlyIncome = money
                .filter(m => {
                    if (m.category !== 'income' || m.status !== 'completed') return false;
                    const taskDate = new Date(m.dueDate || Date.now());
                    return taskDate.getMonth() === currentMonth && 
                           taskDate.getFullYear() === currentYear;
                })
                .reduce((sum, m) => sum + (m.amount || 0), 0);

            const monthlyOthers = money
                .filter(m => {
                    if (m.status !== 'completed') return false;
                    const taskDate = new Date(m.dueDate || Date.now());
                    return taskDate.getMonth() === currentMonth && 
                           taskDate.getFullYear() === currentYear &&
                           m.category === 'other';
                })
                .reduce((sum, m) => sum + (m.amount || 0), 0);

            // Calculate total amount across all bank accounts
            const totalBankBalance = banks.reduce((sum, bank) => {
                return sum + (bank.currentBalance || 0);
            }, 0);

            // Get expenses by category for chart
            const expensesByCategory = {};
            money
                .filter(m => m.category !== 'income' && m.status === 'completed')
                .forEach(m => {
                    const category = m.category || 'other';
                    expensesByCategory[category] = (expensesByCategory[category] || 0) + (m.amount || 0);
                });

            setDashboardData({
                tasks: {
                    total: tasks.length,
                    pending: tasks.filter(t => t.status === 'pending').length,
                    completed: tasks.filter(t => t.status === 'completed').length,
                    inProgress: tasks.filter(t => t.status === 'in-progress').length
                },
                todos: {
                    total: todos.length,
                    pending: todos.filter(t => !t.isCompleted).length,
                    completed: todos.filter(t => t.isCompleted).length
                },
                diary: {
                    total: diary.length
                },
                vaults: {
                    total: vaults.length,
                    items: vaultItemsCount
                },
                money: {
                    total: money.length,
                    pending: money.filter(m => m.status === 'pending').length,
                    completed: money.filter(m => m.status === 'completed').length,
                    totalAmount: totalBankBalance,
                    monthlyExpense: monthlyExpenses,
                    monthlyIncome: monthlyIncome,
                    monthlyOthers: monthlyOthers,
                    expenses: Object.entries(expensesByCategory).map(([category, amount]) => ({
                        category,
                        amount
                    }))
                }
            });
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
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

    const calculatePercentage = (value, max) => {
        if (max === 0) return 0;
        return Math.min((value / max) * 100, 100);
    };

    const getMaxExpense = () => {
        if (dashboardData.money.expenses.length === 0) return 1;
        return Math.max(...dashboardData.money.expenses.map(e => e.amount));
    };
    
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
                        <Link to={`/feature/home/${userId}`} className="sidebar-item active" onClick={closeSidebar}>
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
                    
                    <div className="dashboard-content">
                        <div className="welcome-section">
                            <div className="welcome-content">
                                <h2>Welcome back, {userName || 'User'}! 👋</h2>
                                <p>Here's your comprehensive dashboard overview</p>
                            </div>
                            <div className="welcome-date">
                                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            </div>
                        </div>

                        {loading ? (
                            <div className="loading-state">
                                <div className="loading-spinner"></div>
                                <p>Loading dashboard...</p>
                            </div>
                        ) : (
                            <>
                                {/* Money Management Overview */}
                                <div className="dashboard-section">
                                    <h3 className="section-title">💰 Financial Overview</h3>
                                    <div className="money-overview-grid">
                                        <div className="money-card primary">
                                            <div className="money-card-header">
                                                <span className="money-icon">💵</span>
                                                <span className="money-label">Total Balance</span>
                                                <button 
                                                    className="hide-toggle-btn"
                                                    onClick={() => setHideAmounts(prev => ({ ...prev, totalBalance: !prev.totalBalance }))}
                                                    title={hideAmounts.totalBalance ? "Show amount" : "Hide amount"}
                                                >
                                                    {hideAmounts.totalBalance ? "👁️" : "🙈"}
                                                </button>
                                            </div>
                                            <div className="money-value">
                                                {hideAmounts.totalBalance ? "****" : `₹${dashboardData.money.totalAmount > 0 ? dashboardData.money.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00"}`}
                                            </div>
                                        </div>
                                        <div className="money-card income">
                                            <div className="money-card-header">
                                                <span className="money-icon">📈</span>
                                                <span className="money-label">Monthly Income</span>
                                                <button 
                                                    className="hide-toggle-btn"
                                                    onClick={() => setHideAmounts(prev => ({ ...prev, monthlyIncome: !prev.monthlyIncome }))}
                                                    title={hideAmounts.monthlyIncome ? "Show amount" : "Hide amount"}
                                                >
                                                    {hideAmounts.monthlyIncome ? "👁️" : "🙈"}
                                                </button>
                                            </div>
                                            <div className="money-value">
                                                {hideAmounts.monthlyIncome ? "****" : `₹${(dashboardData.money.monthlyIncome - dashboardData.money.monthlyOthers) > 0 ? (dashboardData.money.monthlyIncome - dashboardData.money.monthlyOthers).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00"}`}
                                            </div>
                                        </div>
                                        <div className="money-card expense">
                                            <div className="money-card-header">
                                                <span className="money-icon">📉</span>
                                                <span className="money-label">Monthly Expense</span>
                                                <button 
                                                    className="hide-toggle-btn"
                                                    onClick={() => setHideAmounts(prev => ({ ...prev, monthlyExpense: !prev.monthlyExpense }))}
                                                    title={hideAmounts.monthlyExpense ? "Show amount" : "Hide amount"}
                                                >
                                                    {hideAmounts.monthlyExpense ? "👁️" : "🙈"}
                                                </button>
                                            </div>
                                            <div className="money-value">
                                                {hideAmounts.monthlyExpense ? "****" : `₹${(dashboardData.money.monthlyExpense - dashboardData.money.monthlyOthers) > 0 ? (dashboardData.money.monthlyExpense - dashboardData.money.monthlyOthers).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00"}`}
                                            </div>
                                        </div>
                                        <div className="money-card net">
                                            <div className="money-card-header">
                                                <span className="money-icon">💼</span>
                                                <span className="money-label">Net Savings</span>
                                                <button 
                                                    className="hide-toggle-btn"
                                                    onClick={() => setHideAmounts(prev => ({ ...prev, netSavings: !prev.netSavings }))}
                                                    title={hideAmounts.netSavings ? "Show amount" : "Hide amount"}
                                                >
                                                    {hideAmounts.netSavings ? "👁️" : "🙈"}
                                                </button>
                                            </div>
                                            <div className="money-value">
                                                {hideAmounts.netSavings ? "****" : `₹${((dashboardData.money.monthlyIncome - dashboardData.money.monthlyOthers) - (dashboardData.money.monthlyExpense - dashboardData.money.monthlyOthers)) > 0 ? ((dashboardData.money.monthlyIncome - dashboardData.money.monthlyOthers) - (dashboardData.money.monthlyExpense - dashboardData.money.monthlyOthers)).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00"}`}
                                            </div>
                                        </div>
                                    </div>

                                    {dashboardData.money.expenses.length > 0 && (
                                        <div className="expense-chart-card">
                                            <h4 className="chart-title">Expenses by Category</h4>
                                            <div className="expense-chart">
                                                {dashboardData.money.expenses.map((expense, index) => {
                                                    const percentage = calculatePercentage(expense.amount, getMaxExpense());
                                                    const colors = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe'];
                                                    return (
                                                        <div key={index} className="chart-bar-item">
                                                            <div className="chart-bar-label">
                                                                <span className="bar-category">{expense.category}</span>
                                                                <span className="bar-amount">₹{expense.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                                            </div>
                                                            <div className="chart-bar-container">
                                                                <div 
                                                                    className="chart-bar" 
                                                                    style={{ 
                                                                        width: `${percentage}%`,
                                                                        backgroundColor: colors[index % colors.length]
                                                                    }}
                                                                >
                                                                    <span className="bar-percentage">{percentage.toFixed(0)}%</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Quick Stats Grid */}
                                <div className="dashboard-section">
                                    <h3 className="section-title">📊 Quick Statistics</h3>
                                    <div className="stats-grid">
                                        <Link to={`/feature/Tasks/${userId}`} className="stat-card interactive">
                                            <div className="stat-icon-wrapper task">
                                                <span className="stat-icon">✅</span>
                                            </div>
                                            <div className="stat-content">
                                                <h4>Tasks</h4>
                                                <div className="stat-numbers">
                                                    <div className="stat-number primary">{dashboardData.tasks.total}</div>
                                                    <div className="stat-breakdown">
                                                        <span className="stat-badge pending">{dashboardData.tasks.pending} pending</span>
                                                        <span className="stat-badge completed">{dashboardData.tasks.completed} done</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>

                                        <Link to={`/feature/Todo/${userId}`} className="stat-card interactive">
                                            <div className="stat-icon-wrapper todo">
                                                <span className="stat-icon">📝</span>
                                            </div>
                                            <div className="stat-content">
                                                <h4>To-Do Lists</h4>
                                                <div className="stat-numbers">
                                                    <div className="stat-number primary">{dashboardData.todos.total}</div>
                                                    <div className="stat-breakdown">
                                                        <span className="stat-badge pending">{dashboardData.todos.pending} pending</span>
                                                        <span className="stat-badge completed">{dashboardData.todos.completed} done</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>

                                        <Link to={`/feature/Diary/${userId}`} className="stat-card interactive">
                                            <div className="stat-icon-wrapper diary">
                                                <span className="stat-icon">📔</span>
                                            </div>
                                            <div className="stat-content">
                                                <h4>Diary Entries</h4>
                                                <div className="stat-numbers">
                                                    <div className="stat-number primary">{dashboardData.diary.total}</div>
                                                    <div className="stat-breakdown">
                                                        <span className="stat-badge info">Daily memories</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>

                                        <Link to={`/feature/Vault/${userId}`} className="stat-card interactive">
                                            <div className="stat-icon-wrapper vault">
                                                <span className="stat-icon">🔐</span>
                                            </div>
                                            <div className="stat-content">
                                                <h4>Vaults</h4>
                                                <div className="stat-numbers">
                                                    <div className="stat-number primary">{dashboardData.vaults.total}</div>
                                                    <div className="stat-breakdown">
                                                        <span className="stat-badge info">{dashboardData.vaults.items} items</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    </div>
                                </div>

                                {/* Progress Overview */}
                                <div className="dashboard-section">
                                    <h3 className="section-title">📈 Progress Overview</h3>
                                    <div className="progress-grid">
                                        <div className="progress-card">
                                            <div className="progress-header">
                                                <span>Task Completion</span>
                                                <span className="progress-percentage">
                                                    {dashboardData.tasks.total > 0 
                                                        ? Math.round((dashboardData.tasks.completed / dashboardData.tasks.total) * 100)
                                                        : 0}%
                                                </span>
                                            </div>
                                            <div className="progress-bar-container">
                                                <div 
                                                    className="progress-bar" 
                                                    style={{ 
                                                        width: `${dashboardData.tasks.total > 0 ? (dashboardData.tasks.completed / dashboardData.tasks.total) * 100 : 0}%`,
                                                        backgroundColor: '#667eea'
                                                    }}
                                                ></div>
                                            </div>
                                            <div className="progress-footer">
                                                {dashboardData.tasks.completed} of {dashboardData.tasks.total} completed
                                            </div>
                                        </div>

                                        <div className="progress-card">
                                            <div className="progress-header">
                                                <span>To-Do Completion</span>
                                                <span className="progress-percentage">
                                                    {dashboardData.todos.total > 0 
                                                        ? Math.round((dashboardData.todos.completed / dashboardData.todos.total) * 100)
                                                        : 0}%
                                                </span>
                                            </div>
                                            <div className="progress-bar-container">
                                                <div 
                                                    className="progress-bar" 
                                                    style={{ 
                                                        width: `${dashboardData.todos.total > 0 ? (dashboardData.todos.completed / dashboardData.todos.total) * 100 : 0}%`,
                                                        backgroundColor: '#f5576c'
                                                    }}
                                                ></div>
                                            </div>
                                            <div className="progress-footer">
                                                {dashboardData.todos.completed} of {dashboardData.todos.total} completed
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Home;
