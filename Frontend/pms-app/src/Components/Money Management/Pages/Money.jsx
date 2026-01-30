import React, { useState, useEffect } from "react";
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import "../Styles/Money.css"

import Header from "../../Home/Pages/Header";
import Button from "../../../Utility/Elements/Button";
import Input from "../../../Utility/Elements/Input";

const Money = () => {
    const { id } = useParams();
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [userName, setUserName] = useState('');
    const [userId, setUserId] = useState('');
    const [tasks, setTasks] = useState([]);
    const [bankAccounts, setBankAccounts] = useState([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [showBankAccountForm, setShowBankAccountForm] = useState(false);
    const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'pending', 'completed'
    const [filterAccount, setFilterAccount] = useState('all'); // 'all' or account id
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [hideAmounts, setHideAmounts] = useState({
        totalAmount: true,
        amountUsed: true,
        amountAboutToBeUsed: true
    });
    const [hideAccountBalances, setHideAccountBalances] = useState({});
    const [newTask, setNewTask] = useState({
        title: '',
        description: '',
        amount: '',
        category: 'expense',
        dueDate: '',
        priority: 'medium',
        bankAccountId: '',
        status: ''
    });
    const [newBankAccount, setNewBankAccount] = useState({
        name: '',
        accountNumber: '',
        bankName: '',
        initialBalance: '0'
    });
    // Check screen size and close sidebar when clicking outside on mobile
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

    // Use a properly-scoped useEffect to avoid infinite loops and potential errors.
    useEffect(() => {
        // Safely read user name from localStorage once after mount
        try {
            const storedName = localStorage.getItem('userName') || '';
            const storedId = localStorage.getItem('userId') || '';
            setUserName(storedName);
            setUserId(storedId);
        } catch (error) {
            // Optionally handle localStorage access errors here
            setUserName('');
            setUserId('');
        }
    }, []);

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    const closeSidebar = () => {
        setSidebarOpen(false);
    };

    // Close sidebar when route changes
    useEffect(() => {
        setSidebarOpen(false);
    }, [id]);

    // Helper function to get ID (handles both _id from MongoDB and id from localStorage)
    const getId = (item) => item?._id || item?.id;
    
    // Helper function to normalize bankAccountId (handles both object and string IDs)
    const getBankAccountId = (task) => {
        if (!task.bankAccountId) return null;
        // If it's an object (populated), get the _id, otherwise use it as-is
        return task.bankAccountId._id || task.bankAccountId.id || task.bankAccountId;
    };

    // Load tasks and bank accounts from API on mount
    useEffect(() => {
        const fetchData = async () => {
            if (!userId) return;
            
            setLoading(true);
            try {
                // Fetch bank accounts
                const bankResponse = await axios.get(`${API_BASE_URL}/feature/money/bank`, {
                    params: { userId }
                });
                const accounts = bankResponse.data || [];
                setBankAccounts(accounts);
                
                // Initialize all account balances as hidden by default
                const hiddenBalances = {};
                accounts.forEach(account => {
                    const accountId = getId(account);
                    hiddenBalances[accountId] = true; // Initially hidden
                });
                setHideAccountBalances(hiddenBalances);
                
                // Set default account for new task if accounts exist
                if (accounts.length > 0 && !newTask.bankAccountId) {
                    setNewTask(prev => ({ ...prev, bankAccountId: getId(accounts[0]) }));
                }

                // Fetch money details (tasks)
                const moneyResponse = await axios.get(`${API_BASE_URL}/feature/money/money`, {
                    params: { userId }
                });
                const fetchedTasks = moneyResponse.data || [];
                setTasks(fetchedTasks);
            } catch (error) {
                console.error('Error loading data:', error);
                // If API calls fail, initialize with empty arrays
                setBankAccounts([]);
                setTasks([]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [userId]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewTask(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleBankAccountInputChange = (e) => {
        const { name, value } = e.target;
        setNewBankAccount(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleAddBankAccount = async (e) => {
        e.preventDefault();
        if (!newBankAccount.name.trim()) {
            alert('Please enter account name');
            return;
        }
        if (!userId) {
            alert('User ID is required');
            return;
        }

        try {
            const accountData = {
                userId,
                name: newBankAccount.name.trim(),
                accountNumber: newBankAccount.accountNumber.trim(),
                bankName: newBankAccount.bankName.trim() || 'Un-Named',
                initialBalance: parseFloat(newBankAccount.initialBalance) || 0
            };

            const response = await axios.post(`${API_BASE_URL}/feature/money/bank`, accountData);
            const newAccount = response.data;

            setBankAccounts(prev => [...prev, newAccount]);
            // Initialize the new account balance as hidden
            setHideAccountBalances(prev => ({ ...prev, [getId(newAccount)]: true }));
            setNewBankAccount({
                name: '',
                accountNumber: '',
                bankName: '',
                initialBalance: '0'
            });
            setShowBankAccountForm(false);
            
            // Set default account for new task if this is the first account
            if (bankAccounts.length === 0) {
                setNewTask(prev => ({ ...prev, bankAccountId: getId(newAccount) }));
            }
        } catch (error) {
            console.error('Error adding bank account:', error);
            alert(error.response?.data?.message || 'Failed to add bank account. Please try again.');
        }
    };

    const handleDownloadCSV = async (accountId, accountName) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/feature/money/bank/${accountId}/export`, {
                params: { userId },
                responseType: 'blob'
            });
            
            // Create a blob and download it
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            const fileName = `bank_account_${accountName || 'export'}_${Date.now()}.csv`;
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error downloading CSV:', error);
            alert(error.response?.data?.message || 'Failed to download CSV. Please try again.');
        }
    };

    const handleDeleteBankAccount = async (accountId) => {
        if (window.confirm('Are you sure you want to delete this bank account? All associated tasks will be unassigned.')) {
            setBankAccounts(prev => prev.filter(acc => getId(acc) !== accountId));
            // Unassign tasks from deleted account
            setTasks(prev => prev.map(task => 
                getId(task) === accountId || task.bankAccountId === accountId
                    ? { ...task, bankAccountId: '' }
                    : task
            ));

            //Add Delete Bank Id Api
            try {
                await axios.put(`${API_BASE_URL}/feature/money/bank/delete/${accountId}`, {
                    msq: `Deleted Bank Account ${accountId}`
                });
            } catch (error) {
                console.error('Error updating task status:', error);
                // Revert optimistic update on error
                setBankAccounts(prev => prev.filter(acc => getId(acc) !== accountId));
                // Unassign tasks from deleted account
                setTasks(prev => prev.map(task => 
                    getId(task) === accountId || task.bankAccountId === accountId
                        ? { ...task, bankAccountId: '' }
                        : task
                ));
                alert(error.response?.data?.message || 'Failed to delete bank account. Please try again.');
            }
        }
    };

    const handleAddTask = async (e) => {
        e.preventDefault();
        if (!newTask.title.trim() || !newTask.amount.trim()) {
            alert('Please fill in title and amount');
            return;
        }
        if (!newTask.bankAccountId) {
            alert('Please select a bank account');
            return;
        }
        if (!userId) {
            alert('User ID is required');
            return;
        }

        try {
            const taskData = {
                userId,
                bankAccountId: newTask.bankAccountId,
                title: newTask.title.trim(),
                description: newTask.description.trim() || '',
                amount: parseFloat(newTask.amount),
                category: newTask.category,
                dueDate: newTask.dueDate || new Date().toISOString(),
                priority: newTask.priority,
                status: 'pending'
            };

            const response = await axios.post(`${API_BASE_URL}/feature/money/money`, taskData);
            const newTaskData = response.data;

            // Refresh tasks and bank accounts from server to ensure complete sync
            const [moneyResponse, bankResponse] = await Promise.all([
                axios.get(`${API_BASE_URL}/feature/money/money`, { params: { userId } }),
                axios.get(`${API_BASE_URL}/feature/money/bank`, { params: { userId } })
            ]);
            setTasks(moneyResponse.data || []);
            setBankAccounts(bankResponse.data || []);
            
            setNewTask({
                title: '',
                description: '',
                amount: '',
                category: 'expense',
                dueDate: '',
                priority: 'medium',
                bankAccountId: bankAccounts.length > 0 ? getId(bankAccounts[0]) : ''
            });
            setShowAddForm(false);
        } catch (error) {
            console.error('Error adding task:', error);
            alert(error.response?.data?.message || 'Failed to add task. Please try again.');
        }
    };

    const handleToggleComplete = async (taskId) => {
        // Find the task to get current status
        const currentTask = tasks.find(task => getId(task) === taskId);
        if (!currentTask) return;

        const oldStatus = currentTask.status;
        const newStatus = oldStatus === 'completed' ? 'pending' : 'completed';
        
        // NO optimistic update - wait for server response to ensure database sync
        // This prevents frontend from showing incorrect state
        setLoading(true);

        // Persist to database first
        try {
            const response = await axios.put(`${API_BASE_URL}/feature/money/money/${taskId}`, {
                status: newStatus
            });
            
            // Verify the response has the correct status
            if (!response.data) {
                throw new Error('No data received from server');
            }
            
            if (response.data.status !== newStatus) {
                console.error('Status mismatch: Expected', newStatus, 'but got', response.data.status);
                throw new Error(`Status update failed. Expected ${newStatus} but got ${response.data.status}`);
            }
            
            // Refresh ALL tasks and bank accounts from server to ensure complete database sync
            const [moneyResponse, bankResponse] = await Promise.all([
                axios.get(`${API_BASE_URL}/feature/money/money`, { params: { userId } }),
                axios.get(`${API_BASE_URL}/feature/money/bank`, { params: { userId } })
            ]);
            
            setTasks(moneyResponse.data || []);
            setBankAccounts(bankResponse.data || []);
        } catch (error) {
            console.error('Error updating task status:', error);
            alert(error.response?.data?.message || error.message || 'Failed to update task status. Please try again.');
            
            // Always refresh from server to get actual state, even on error
            try {
                const [moneyResponse, bankResponse] = await Promise.all([
                    axios.get(`${API_BASE_URL}/feature/money/money`, { params: { userId } }),
                    axios.get(`${API_BASE_URL}/feature/money/bank`, { params: { userId } })
                ]);
                setTasks(moneyResponse.data || []);
                setBankAccounts(bankResponse.data || []);
            } catch (refreshError) {
                console.error('Error refreshing data:', refreshError);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAllTasks = async () => {
        if (window.confirm('Are you sure you want to delete ALL money tasks? This action cannot be undone.')) {
            try {
                await axios.delete(`${API_BASE_URL}/feature/money/money/delete-all`, {
                    params: { userId }
                });
                // Refresh both tasks and bank accounts from server to ensure sync
                const [moneyResponse, bankResponse] = await Promise.all([
                    axios.get(`${API_BASE_URL}/feature/money/money`, { params: { userId } }),
                    axios.get(`${API_BASE_URL}/feature/money/bank`, { params: { userId } })
                ]);
                setTasks(moneyResponse.data || []);
                setBankAccounts(bankResponse.data || []);
                alert('All money tasks deleted successfully!');
            } catch (error) {
                console.error('Error deleting all tasks:', error);
                alert(error.response?.data?.message || 'Failed to delete all tasks. Please try again.');
            }
        }
    };

    const handleDeleteTask = async (taskId) => {
        if (window.confirm('Are you sure you want to delete this task?')) {
            const taskToDelete = tasks.find(task => getId(task) === taskId);
            // NO optimistic update - wait for server response

            // Delete task from database
            try {
                await axios.put(`${API_BASE_URL}/feature/money/money/delete/${taskId}`, {
                    msq: `Deleted Money Task ${taskId}`
                });
                
                // Refresh both tasks and bank accounts from server to ensure complete sync
                const [moneyResponse, bankResponse] = await Promise.all([
                    axios.get(`${API_BASE_URL}/feature/money/money`, { params: { userId } }),
                    axios.get(`${API_BASE_URL}/feature/money/bank`, { params: { userId } })
                ]);
                setTasks(moneyResponse.data || []);
                setBankAccounts(bankResponse.data || []);
            } catch (error) {
                console.error('Error deleting task:', error);
                alert(error.response?.data?.message || 'Failed to delete money task. Please try again.');
                
                // Refresh from server to get actual state
                try {
                    const moneyResponse = await axios.get(`${API_BASE_URL}/feature/money/money`, {
                        params: { userId }
                    });
                    setTasks(moneyResponse.data || []);
                } catch (refreshError) {
                    console.error('Error refreshing tasks:', refreshError);
                }
            }
        }
    };

    const filteredTasks = tasks.filter(task => {
        const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
        
        // Handle account filter with consistent ID comparison
        let matchesAccount = true;
        if (filterAccount !== 'all') {
            const taskBankAccountId = getBankAccountId(task);
            if (taskBankAccountId) {
                const normalizedTaskId = taskBankAccountId?.toString ? taskBankAccountId.toString() : String(taskBankAccountId);
                const normalizedFilterId = filterAccount?.toString ? filterAccount.toString() : String(filterAccount);
                matchesAccount = normalizedTaskId === normalizedFilterId;
            } else {
                matchesAccount = false;
            }
        }
        
        const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                             task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                             task.category.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesStatus && matchesAccount && matchesSearch;
    });

    // Sort tasks so that pending tasks appear before completed tasks
    const sortedFilteredTasks = [...filteredTasks].sort((a, b) => {
        const statusOrder = { pending: 0, 'in-progress': 1, completed: 2 };
        const aStatusRank = statusOrder[a.status] ?? 3;
        const bStatusRank = statusOrder[b.status] ?? 3;
        if (aStatusRank !== bStatusRank) {
            return aStatusRank - bStatusRank;
        }

        // If same status, try to sort by dueDate (earlier first), otherwise by createdAt
        const aDue = a.dueDate ? new Date(a.dueDate) : null;
        const bDue = b.dueDate ? new Date(b.dueDate) : null;
        if (aDue && bDue && aDue.getTime() !== bDue.getTime()) {
            return aDue - bDue;
        }

        const aCreated = a.createdAt ? new Date(a.createdAt) : null;
        const bCreated = b.createdAt ? new Date(b.createdAt) : null;
        if (aCreated && bCreated && aCreated.getTime() !== bCreated.getTime()) {
            return bCreated - aCreated; // newer first
        }

        return 0;
    });

    // Calculate amounts - income reduces amount to be used, expenses add to it
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const pendingTasks = tasks.filter(t => t.status === 'pending').length;
    
    // Total amount (all tasks - expenses are positive, income is negative for display)
    const totalAmount = tasks.reduce((sum, task) => {
        const amount = task.amount || 0;
        return sum + ((task.category === 'other' || task.category === 'income') ? 0 : amount);
    }, 0);
    
    // Amount used (completed tasks)
    const amountUsed = tasks
        .filter(t => t.status === 'completed')
        .reduce((sum, task) => {
            const amount = task.amount || 0;
            return sum + ((task.category === 'other' || task.category === 'income') ? 0 : amount);
        }, 0);
    
    // Amount about to be used (pending tasks - income reduces this, expenses add to it)
    const amountAboutToBeUsed = tasks
        .filter(t => t.status === 'pending')
        .reduce((sum, task) => {
            const amount = task.amount || 0;
            // Income reduces amount to be used, expenses add to it
            return sum + ((task.category === 'other' || task.category === 'income') ? 0 : amount);
        }, 0);

    // Calculate per-account statistics
    const getAccountStats = (accountId, initialBalance = 0, currentBalanceFromDB = null) => {
        // Normalize accountId to string for comparison
        const normalizedAccountId = accountId?.toString ? accountId.toString() : String(accountId);
        
        // Filter tasks that belong to this account
        const accountTasks = tasks.filter(t => {
            const taskBankAccountId = getBankAccountId(t);
            if (!taskBankAccountId) return false;
            const normalizedTaskId = taskBankAccountId?.toString ? taskBankAccountId.toString() : String(taskBankAccountId);
            return normalizedTaskId === normalizedAccountId;
        });
        
        // Get current month and year
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        
        // Total: Sum of income for current month only
        const total = accountTasks
            .filter(task => {
                if (task.category !== 'income') return false;
                const taskDate = new Date(task.createdAt || task.dueDate || Date.now());
                return taskDate.getMonth() === currentMonth && taskDate.getFullYear() === currentYear;
            })
            .reduce((sum, task) => sum + (task.amount || 0), 0);
        
        // Used: Sum of completed expenses only (not income)
        const used = accountTasks
            .filter(t => t.status === 'completed' && t.category !== 'income')
            .reduce((sum, task) => sum + (task.amount || 0), 0);
        
        // Pending: Sum of pending expenses (amount about to be used)
        const pending = accountTasks
            .filter(t => t.status === 'pending' && t.category !== 'income')
            .reduce((sum, task) => sum + (task.amount || 0), 0);
        
        // Use currentBalance from database if available, otherwise calculate it
        // This ensures we show what's actually stored in the database
        let currentBalance;
        if (currentBalanceFromDB !== null && currentBalanceFromDB !== undefined) {
            currentBalance = parseFloat(currentBalanceFromDB) || 0;
        } else {
            // Fallback calculation if currentBalance not in database yet
            const completedIncome = accountTasks
                .filter(t => t.status === 'completed' && t.category === 'income')
                .reduce((sum, task) => sum + (parseFloat(task.amount) || 0), 0);
            
            const completedExpenses = accountTasks
                .filter(t => t.status === 'completed' && t.category !== 'income')
                .reduce((sum, task) => sum + (parseFloat(task.amount) || 0), 0);
            
            const initialBal = parseFloat(initialBalance) || 0;
            currentBalance = initialBal + completedIncome - completedExpenses;
        }
        
        return {
            total,
            used,
            pending,
            currentBalance
        };
    };
    
    return (
        <div className="home-container">
            {/* Mobile Menu Toggle Button - Only show on mobile/tablet */}
            {isMobile && (
                <button 
                    className="mobile-menu-toggle" 
                    onClick={toggleSidebar}
                    aria-label="Toggle menu"
                >
                    ☰
                </button>
            )}

            {/* Sidebar Overlay - Only show on mobile/tablet */}
            {isMobile && (
                <div 
                    className={`sidebar ${sidebarOpen ? 'active' : ''}`}
                    onClick={(e) => {
                        // Only close if backdrop (not sidebar) is clicked
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
                        <Link to={`/feature/money/${userId}`} className="sidebar-item active" onClick={closeSidebar}>
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


                {/* Main Content Area */}
                <div className="home-content">
                    {/* Sub Header */}
                    <Header userName={userName} />
                    
                    {/* Money Task Management Content */}
                    <div className="money-content">
                        {/* Statistics Cards - Amount Dashboard */}
                        <div className="money-stats">
                            <div className="stat-card stat-card-total">
                                <div className="stat-icon">💰</div>
                                <div className="stat-info">
                                    <div className="stat-label-wrapper">
                                        <div className="stat-label">Total Amount Spendings</div>
                                        <button 
                                            className="hide-toggle-btn"
                                            onClick={() => setHideAmounts(prev => ({ ...prev, totalAmount: !prev.totalAmount }))}
                                            title={hideAmounts.totalAmount ? "Show amount" : "Hide amount"}
                                        >
                                            {hideAmounts.totalAmount ? "👁️" : "🙈"}
                                        </button>
                                    </div>
                                    <div className="stat-value">{hideAmounts.totalAmount ? "****" : `₹${totalAmount > 0 ? totalAmount.toFixed(2) : "0.00"}`}</div>
                                    <div className="stat-subtext">{tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}</div>
                                </div>
                            </div>
                            <div className="stat-card stat-card-used">
                                <div className="stat-icon">✅</div>
                                <div className="stat-info">
                                    <div className="stat-label-wrapper">
                                        <div className="stat-label">Amount Spent</div>
                                        <button 
                                            className="hide-toggle-btn"
                                            onClick={() => setHideAmounts(prev => ({ ...prev, amountUsed: !prev.amountUsed }))}
                                            title={hideAmounts.amountUsed ? "Show amount" : "Hide amount"}
                                        >
                                            {hideAmounts.amountUsed ? "👁️" : "🙈"}
                                        </button>
                                    </div>
                                    <div className="stat-value">{hideAmounts.amountUsed ? "****" : `₹${amountUsed > 0 ? amountUsed.toFixed(2) : "0.00"}`}</div>
                                    <div className="stat-subtext">{completedTasks} {completedTasks === 1 ? 'task completed' : 'tasks completed'}</div>
                                </div>
                            </div>
                            <div className="stat-card stat-card-pending">
                                <div className="stat-icon">⏳</div>
                                <div className="stat-info">
                                    <div className="stat-label-wrapper">
                                        <div className="stat-label">Amount About to be Spend</div>
                                        <button 
                                            className="hide-toggle-btn"
                                            onClick={() => setHideAmounts(prev => ({ ...prev, amountAboutToBeUsed: !prev.amountAboutToBeUsed }))}
                                            title={hideAmounts.amountAboutToBeUsed ? "Show amount" : "Hide amount"}
                                        >
                                            {hideAmounts.amountAboutToBeUsed ? "👁️" : "🙈"}
                                        </button>
                                    </div>
                                    <div className="stat-value">{hideAmounts.amountAboutToBeUsed ? "****" : `₹${amountAboutToBeUsed > 0 ? amountAboutToBeUsed.toFixed(2) : "0.00"}`}</div>
                                    <div className="stat-subtext">{pendingTasks} {pendingTasks === 1 ? 'task pending' : 'tasks pending'}</div>
                                </div>
                            </div>
                        </div>

                        {/* Statistics Cards - Task Count Dashboard */}
                        <div className="money-stats">
                            <div className="stat-card stat-card-tasks-total">
                                <div className="stat-icon">📊</div>
                                <div className="stat-info">
                                    <div className="stat-label">Total Transactions</div>
                                    <div className="stat-value">{tasks.length}</div>
                                    <div className="stat-subtext">All tasks combined</div>
                                </div>
                            </div>
                            <div className="stat-card stat-card-tasks-completed">
                                <div className="stat-icon">✅</div>
                                <div className="stat-info">
                                    <div className="stat-label">Completed Transactions</div>
                                    <div className="stat-value">{completedTasks}</div>
                                    <div className="stat-subtext">₹{amountUsed.toFixed(2)} used</div>
                                </div>
                            </div>
                            <div className="stat-card stat-card-tasks-pending">
                                <div className="stat-icon">⏳</div>
                                <div className="stat-info">
                                    <div className="stat-label">Pending Transactions</div>
                                    <div className="stat-value">{pendingTasks}</div>
                                    <div className="stat-subtext">₹{amountAboutToBeUsed.toFixed(2)} pending</div>
                                </div>
                            </div>
                        </div>

                        {/* Bank Accounts Section */}
                        <div className="bank-accounts-section">
                            <div className="section-header">
                                <h3>Bank Accounts</h3>
                                <Button
                                    class="add-account-btn"
                                    text={showBankAccountForm ? "Cancel" : "+ Add Account"}
                                    click={() => setShowBankAccountForm(!showBankAccountForm)}
                                />
                            </div>
                            
                            {showBankAccountForm && (
                                <div className="add-account-form">
                                    <h4>Add New Bank Account</h4>
                                    <form onSubmit={handleAddBankAccount}>
                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>Account Name *</label>
                                                <Input
                                                    type="text"
                                                    name="name"
                                                    class="form-input"
                                                    holder="e.g., Savings Account"
                                                    value={newBankAccount.name}
                                                    onChange={handleBankAccountInputChange}
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Account Number</label>
                                                <Input
                                                    type="text"
                                                    name="accountNumber"
                                                    class="form-input"
                                                    holder="Account number"
                                                    value={newBankAccount.accountNumber}
                                                    onChange={handleBankAccountInputChange}
                                                />
                                            </div>
                                        </div>
                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>Bank Name</label>
                                                <Input
                                                    type="text"
                                                    name="bankName"
                                                    class="form-input"
                                                    holder="Bank name"
                                                    value={newBankAccount.bankName}
                                                    onChange={handleBankAccountInputChange}
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Initial Balance</label>
                                                <Input
                                                    type="number"
                                                    name="initialBalance"
                                                    class="form-input"
                                                    holder="0.00"
                                                    value={newBankAccount.initialBalance}
                                                    onChange={handleBankAccountInputChange}
                                                    step="0.01"
                                                />
                                            </div>
                                        </div>
                                        <div className="form-actions">
                                            <Button
                                                type="submit"
                                                class="submit-btn"
                                                text="Add Account"
                                            />
                                            <Button
                                                type="button"
                                                class="cancel-btn"
                                                text="Cancel"
                                                click={() => {
                                                    setShowBankAccountForm(false);
                                                    setNewBankAccount({
                                                        name: '',
                                                        accountNumber: '',
                                                        bankName: '',
                                                        initialBalance: '0'
                                                    });
                                                }}
                                            />
                                        </div>
                                    </form>
                                </div>
                            )}

                            {/* Bank Accounts List */}
                            <div className="bank-accounts-list">
                                {bankAccounts.map(account => {
                                    const accountId = getId(account);
                                    // Use currentBalance from database, fallback to initialBalance if not set
                                    const currentBalanceFromDB = account.currentBalance !== undefined ? account.currentBalance : account.initialBalance;
                                    const stats = getAccountStats(accountId, account.initialBalance || 0, currentBalanceFromDB);
                                    return (
                                        <div key={accountId} className="bank-account-card">
                                            <div className="account-header">
                                                <div className="account-info">
                                                    <h4>{account.name}</h4>
                                                    <p>{account.bankName} {account.accountNumber && `• ${account.accountNumber}`}</p>
                                                </div>
                                                <div className="account-actions">
                                                    <button
                                                        className="download-account-btn"
                                                        onClick={() => handleDownloadCSV(accountId, account.name)}
                                                        title="Download CSV"
                                                    >
                                                        📥
                                                    </button>
                                                    <button
                                                        className="delete-account-btn"
                                                        onClick={() => handleDeleteBankAccount(accountId)}
                                                        title="Delete account"
                                                    >
                                                        🗑️
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="account-stats">
                                                <div className="account-stat-item">
                                                    <div className="account-stat-header">
                                                        <span className="stat-label">Current Balance</span>
                                                        <button 
                                                            className="hide-toggle-btn-small"
                                                            onClick={() => setHideAccountBalances(prev => ({ ...prev, [accountId]: !prev[accountId] }))}
                                                            title={hideAccountBalances[accountId] ? "Show balance" : "Hide balance"}
                                                        >
                                                            {hideAccountBalances[accountId] ? "👁️" : "🙈"}
                                                        </button>
                                                    </div>
                                                    <span className="stat-value">{hideAccountBalances[accountId] ? "****" : `₹${stats.currentBalance > 0 ? stats.currentBalance.toFixed(2) : "0.00"}`}</span>
                                                    <span className="stat-hint">Income - Used</span>
                                                </div>
                                                <div className="account-stat-item">
                                                    <span className="stat-label">Total Income (This Month)</span>
                                                    <span className="stat-value">₹{stats.total.toFixed(2)}</span>
                                                    <span className="stat-hint">Current month only</span>
                                                </div>
                                                <div className="account-stat-item">
                                                    <span className="stat-label">Spent</span>
                                                    <span className="stat-value used">₹{stats.used.toFixed(2)}</span>
                                                    <span className="stat-hint">Completed expenses</span>
                                                </div>
                                                <div className="account-stat-item">
                                                    <span className="stat-label">Pending</span>
                                                    <span className="stat-value pending">₹{stats.pending.toFixed(2)}</span>
                                                    <span className="stat-hint">Amount to be used</span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Action Bar */}
                        <div className="money-actions">
                            <div className="search-filter-bar">
                                <Input
                                    type="text"
                                    class="search-input"
                                    holder="Search tasks..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                <select
                                    className="account-filter"
                                    value={filterAccount}
                                    onChange={(e) => setFilterAccount(e.target.value)}
                                >
                                    <option value="all">All Accounts</option>
                                    {bankAccounts.map(acc => {
                                        const accId = getId(acc);
                                        return <option key={accId} value={accId}>{acc.name}</option>;
                                    })}
                                </select>
                                <div className="filter-buttons">
                                    <button
                                        className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
                                        onClick={() => setFilterStatus('all')}
                                    >
                                        All
                                    </button>
                                    <button
                                        className={`filter-btn ${filterStatus === 'pending' ? 'active' : ''}`}
                                        onClick={() => setFilterStatus('pending')}
                                    >
                                        Pending
                                    </button>
                                    <button
                                        className={`filter-btn ${filterStatus === 'completed' ? 'active' : ''}`}
                                        onClick={() => setFilterStatus('completed')}
                                    >
                                        Completed
                                    </button>
                                </div>
                            </div>
                            <div className="action-buttons-group">
                                <Button
                                    class="add-task-btn"
                                    text={showAddForm ? "Cancel" : "+ Add Task"}
                                    click={() => setShowAddForm(!showAddForm)}
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

                        {/* Add Task Form */}
                        {showAddForm && (
                            <div className="add-task-form">
                                <h3>Add New Money Task</h3>
                                <form onSubmit={handleAddTask}>
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
                                            <label>Amount (₹) *</label>
                                            <Input
                                                type="number"
                                                name="amount"
                                                class="form-input"
                                                holder="0.00"
                                                value={newTask.amount}
                                                onChange={handleInputChange}
                                                step="0.01"
                                            />
                                        </div>
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Bank Account *</label>
                                            <select
                                                name="bankAccountId"
                                                className="form-input"
                                                value={newTask.bankAccountId}
                                                onChange={handleInputChange}
                                                required
                                            >
                                                <option value="">Select Account</option>
                                                {bankAccounts.map(acc => {
                                                    const accId = getId(acc);
                                                    return (
                                                        <option key={accId} value={accId}>
                                                            {acc.name} {acc.bankName && `(${acc.bankName})`}
                                                        </option>
                                                    );
                                                })}
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label>Category</label>
                                            <select
                                                name="category"
                                                className="form-input"
                                                value={newTask.category}
                                                onChange={handleInputChange}
                                            >
                                                <option value="expense">Expense</option>
                                                <option value="income">Income</option>
                                                <option value="investment">Investment</option>
                                                <option value="savings">Savings</option>
                                                <option value="bill">Bill</option>
                                                <option value="other">Other</option>
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label>Priority</label>
                                            <select
                                                name="priority"
                                                className="form-input"
                                                value={newTask.priority}
                                                onChange={handleInputChange}
                                            >
                                                <option value="low">Low</option>
                                                <option value="medium">Medium</option>
                                                <option value="high">High</option>
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label>Due Date</label>
                                            <Input
                                                type="date"
                                                name="dueDate"
                                                class="form-input"
                                                value={newTask.dueDate}
                                                onChange={handleInputChange}
                                            />
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
                                            text="Add Task"
                                        />
                                        <Button
                                            type="button"
                                            class="cancel-btn"
                                            text="Cancel"
                                            click={() => {
                                                setShowAddForm(false);
                                                setNewTask({
                                                    title: '',
                                                    description: '',
                                                    amount: '',
                                                    category: 'expense',
                                                    dueDate: '',
                                                    priority: 'medium',
                                                    bankAccountId: bankAccounts.length > 0 ? getId(bankAccounts[0]) : ''
                                                });
                                            }}
                                        />
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* Tasks List */}
                        <div className="tasks-list">
                            {sortedFilteredTasks.length === 0 ? (
                                <div className="empty-state">
                                    <div className="empty-icon">📝</div>
                                    <h3>No tasks found</h3>
                                    <p>{tasks.length === 0 ? 'Create your first money task to get started!' : 'Try adjusting your filters or search query.'}</p>
                                </div>
                            ) : (
                                sortedFilteredTasks.map(task => {
                                    const taskId = getId(task);
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
                                                    <h4>
                                                        {task.title}
                                                    </h4>
                                                    <div className="task-meta">
                                                        {task.bankAccountId && (
                                                            <span className="account-badge">
                                                                🏦 {task.bankAccountId.name || bankAccounts.find(acc => {
                                                                    const taskBankAccountId = getBankAccountId(task);
                                                                    return taskBankAccountId && getId(acc) === taskBankAccountId;
                                                                })?.name || 'Unknown Account'}
                                                            </span>
                                                        )}
                                                        <span className={`category-badge category-${task.category}`}>
                                                            {task.category}
                                                        </span>
                                                        <span className={`priority-badge priority-${task.priority}`}>
                                                            {task.priority}
                                                        </span>
                                                        {task.dueDate && (
                                                            <span className="due-date">
                                                                📅 {new Date(task.dueDate).toLocaleDateString()}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className={`task-amount ${task.status === 'completed' ? 'completed-amount' : ''}`}>
                                                    <span className={task.category === 'income' ? 'income' : 'expense'}>
                                                        {task.category === 'income' ? '+' : '-'}₹{task.amount.toFixed(2)}
                                                    </span>
                                                    {task.status === 'completed' && (
                                                        <span className="completed-badge">✓ Completed</span>
                                                    )}
                                                </div>
                                            </div>
                                            {task.description && (
                                                <div className="task-description">
                                                    {task.description}
                                                </div>
                                            )}
                                            <div className="task-actions">
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

export default Money;