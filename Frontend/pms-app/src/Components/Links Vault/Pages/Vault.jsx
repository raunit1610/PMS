import React, { useState, useEffect } from "react";
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import '../Styles/Vault.css';

import Header from "../../Home/Pages/Header";
import Button from "../../../Utility/Elements/Button";
import Input from "../../../Utility/Elements/Input";

const Vault = () => {
    const { id } = useParams();
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [userName, setUserName] = useState('');
    const [userId, setUserId] = useState('');
    const [vaults, setVaults] = useState([]);
    const [selectedVault, setSelectedVault] = useState(null);
    const [vaultItems, setVaultItems] = useState([]);
    const [showVaultForm, setShowVaultForm] = useState(false);
    const [showItemForm, setShowItemForm] = useState(false);
    const [editingVault, setEditingVault] = useState(null);
    const [editingItem, setEditingItem] = useState(null);
    const [loading, setLoading] = useState(false);
    const [newVault, setNewVault] = useState({
        name: '',
        description: '',
        category: 'general'
    });
    const [newItem, setNewItem] = useState({
        name: '',
        link: '',
        username: '',
        password: '',
        notes: ''
    });
    const [showPassword, setShowPassword] = useState({});

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
            fetchVaults();
        }
    }, [userId]);

    useEffect(() => {
        if (selectedVault) {
            fetchVaultItems(selectedVault);
        }
    }, [selectedVault]);

    const fetchVaults = async () => {
        if (!userId) return;
        setLoading(true);
        try {
            const response = await axios.get(`${API_BASE_URL}/feature/vaults`, {
                params: { userId }
            });
            setVaults(response.data || []);
        } catch (error) {
            console.error('Error loading vaults:', error);
            setVaults([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchVaultItems = async (vaultId) => {
        if (!vaultId) return;
        try {
            const response = await axios.get(`${API_BASE_URL}/feature/vaults/${vaultId}/items`);
            setVaultItems(response.data || []);
        } catch (error) {
            console.error('Error loading vault items:', error);
            setVaultItems([]);
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

    const handleVaultInputChange = (e) => {
        const { name, value } = e.target;
        setNewVault(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleItemInputChange = (e) => {
        const { name, value } = e.target;
        setNewItem(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleCreateVault = async (e) => {
        e.preventDefault();
        if (!newVault.name.trim()) {
            alert('Please enter a vault name');
            return;
        }
        if (!userId) {
            alert('User ID is required');
            return;
        }

        try {
            await axios.post(`${API_BASE_URL}/feature/vaults`, {
                userId,
                name: newVault.name.trim(),
                description: newVault.description.trim() || '',
                category: newVault.category
            });
            setNewVault({
                name: '',
                description: '',
                category: 'general'
            });
            setShowVaultForm(false);
            fetchVaults();
        } catch (error) {
            console.error('Error creating vault:', error);
            alert(error.response?.data?.message || 'Failed to create vault. Please try again.');
        }
    };

    const handleUpdateVault = async (e) => {
        e.preventDefault();
        if (!editingVault || !newVault.name.trim()) {
            alert('Please enter a vault name');
            return;
        }

        try {
            await axios.put(`${API_BASE_URL}/feature/vaults/${getId(editingVault)}`, {
                name: newVault.name.trim(),
                description: newVault.description.trim() || '',
                category: newVault.category
            });
            setEditingVault(null);
            setNewVault({
                name: '',
                description: '',
                category: 'general'
            });
            setShowVaultForm(false);
            fetchVaults();
        } catch (error) {
            console.error('Error updating vault:', error);
            alert(error.response?.data?.message || 'Failed to update vault.');
        }
    };

    const handleDeleteVault = async (vaultId) => {
        if (window.confirm('Are you sure you want to delete this vault? All items in it will be deleted too.')) {
            try {
                await axios.delete(`${API_BASE_URL}/feature/vaults/${vaultId}`);
                if (selectedVault === vaultId) {
                    setSelectedVault(null);
                    setVaultItems([]);
                }
                fetchVaults();
            } catch (error) {
                console.error('Error deleting vault:', error);
                alert(error.response?.data?.message || 'Failed to delete vault.');
            }
        }
    };

    const handleEditVault = (vault) => {
        setEditingVault(vault);
        setNewVault({
            name: vault.name,
            description: vault.description || '',
            category: vault.category || 'general'
        });
        setShowVaultForm(true);
    };

    const handleCreateItem = async (e) => {
        e.preventDefault();
        if (!newItem.name.trim()) {
            alert('Please enter an item name');
            return;
        }
        if (!selectedVault) {
            alert('Please select a vault first');
            return;
        }

        try {
            await axios.post(`${API_BASE_URL}/feature/vaults/${selectedVault}/items`, {
                name: newItem.name.trim(),
                link: newItem.link.trim() || '',
                username: newItem.username.trim() || '',
                password: newItem.password || '',
                notes: newItem.notes.trim() || ''
            });
            setNewItem({
                name: '',
                link: '',
                username: '',
                password: '',
                notes: ''
            });
            setShowItemForm(false);
            fetchVaultItems(selectedVault);
        } catch (error) {
            console.error('Error creating item:', error);
            alert(error.response?.data?.message || 'Failed to create item. Please try again.');
        }
    };

    const handleUpdateItem = async (e) => {
        e.preventDefault();
        if (!editingItem || !newItem.name.trim()) {
            alert('Please enter an item name');
            return;
        }

        try {
            await axios.put(`${API_BASE_URL}/feature/vaults/items/${getId(editingItem)}`, {
                name: newItem.name.trim(),
                link: newItem.link.trim() || '',
                username: newItem.username.trim() || '',
                password: newItem.password || '',
                notes: newItem.notes.trim() || ''
            });
            setEditingItem(null);
            setNewItem({
                name: '',
                link: '',
                username: '',
                password: '',
                notes: ''
            });
            setShowItemForm(false);
            fetchVaultItems(selectedVault);
        } catch (error) {
            console.error('Error updating item:', error);
            alert(error.response?.data?.message || 'Failed to update item.');
        }
    };

    const handleDeleteItem = async (itemId) => {
        if (window.confirm('Are you sure you want to delete this item?')) {
            try {
                await axios.delete(`${API_BASE_URL}/feature/vaults/items/${itemId}`);
                fetchVaultItems(selectedVault);
            } catch (error) {
                console.error('Error deleting item:', error);
                alert(error.response?.data?.message || 'Failed to delete item.');
            }
        }
    };

    const handleEditItem = (item) => {
        setEditingItem(item);
        setNewItem({
            name: item.name,
            link: item.link || '',
            username: item.username || '',
            password: item.password || '',
            notes: item.notes || ''
        });
        setShowItemForm(true);
    };

    const togglePasswordVisibility = (itemId) => {
        setShowPassword(prev => ({
            ...prev,
            [itemId]: !prev[itemId]
        }));
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text).then(() => {
            alert('Copied to clipboard!');
        }).catch(err => {
            console.error('Failed to copy:', err);
        });
    };

    const handleDownloadCSV = async () => {
        if (!selectedVault || vaultItems.length === 0) {
            alert('Please select a vault with items to download');
            return;
        }
        if (!userId) {
            alert('User ID is required');
            return;
        }

        try {
            const response = await axios.get(`${API_BASE_URL}/feature/vaults/${selectedVault}/export`, {
                params: { userId },
                responseType: 'blob'
            });
            
            // Create a blob and download it
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            const vault = vaults.find(v => getId(v) === selectedVault);
            const vaultName = vault ? vault.name.replace(/[^a-zA-Z0-9]/g, '_') : 'vault';
            const fileName = `vault_${vaultName}_${Date.now()}.csv`;
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
                        <Link to={`/feature/Diary/${userId}`} className="sidebar-item" onClick={closeSidebar}>
                            <span className="sidebar-icon">📔</span>
                            <span className="sidebar-text">Diary</span>
                        </Link>
                        <Link to={`/feature/Vault/${userId}`} className="sidebar-item active" onClick={closeSidebar}>
                            <span className="sidebar-icon">🔐</span>
                            <span className="sidebar-text">Vault</span>
                        </Link>
                    </nav>
                    <div className="sidebar-menu" onClick={closeSidebar}>☰</div>
                </div>

                <div className="home-content">
                    <Header userName={userName} />
                    
                    <div className="vault-content">
                        <div className="vault-layout">
                            <div className="vaults-sidebar">
                                <div className="vaults-header">
                                    <h3>Vaults</h3>
                                    <Button
                                        class="add-vault-btn"
                                        text={showVaultForm ? "Cancel" : "+ New Vault"}
                                        click={() => {
                                            setShowVaultForm(!showVaultForm);
                                            setEditingVault(null);
                                            setNewVault({
                                                name: '',
                                                description: '',
                                                category: 'general'
                                            });
                                        }}
                                    />
                                </div>

                                {showVaultForm && (
                                    <div className="vault-form">
                                        <form onSubmit={editingVault ? handleUpdateVault : handleCreateVault}>
                                            <div className="form-group">
                                                <label>Vault Name *</label>
                                                <Input
                                                    type="text"
                                                    name="name"
                                                    class="form-input"
                                                    holder="Enter vault name"
                                                    value={newVault.name}
                                                    onChange={handleVaultInputChange}
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Description</label>
                                                <textarea
                                                    name="description"
                                                    className="form-input form-textarea"
                                                    placeholder="Enter description"
                                                    value={newVault.description}
                                                    onChange={handleVaultInputChange}
                                                    rows="3"
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Category</label>
                                                <select
                                                    name="category"
                                                    className="form-input"
                                                    value={newVault.category}
                                                    onChange={handleVaultInputChange}
                                                >
                                                    <option value="general">General</option>
                                                    <option value="work">Work</option>
                                                    <option value="personal">Personal</option>
                                                    <option value="finance">Finance</option>
                                                    <option value="social">Social</option>
                                                </select>
                                            </div>
                                            <div className="form-actions">
                                                <Button
                                                    type="submit"
                                                    class="submit-btn"
                                                    text={editingVault ? "Update" : "Create"}
                                                />
                                            </div>
                                        </form>
                                    </div>
                                )}

                                <div className="vaults-list">
                                    {loading ? (
                                        <div className="loading-state">Loading vaults...</div>
                                    ) : vaults.length === 0 ? (
                                        <div className="empty-state-small">
                                            <p>No vaults yet. Create one to get started!</p>
                                        </div>
                                    ) : (
                                        vaults.map(vault => {
                                            const vaultId = getId(vault);
                                            return (
                                                <div
                                                    key={vaultId}
                                                    className={`vault-item ${selectedVault === vaultId ? 'active' : ''}`}
                                                    onClick={() => setSelectedVault(vaultId)}
                                                >
                                                    <div className="vault-item-header">
                                                        <h4>{vault.name}</h4>
                                                        <div className="vault-item-actions">
                                                            <button
                                                                className="action-btn-small"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleEditVault(vault);
                                                                }}
                                                                title="Edit vault"
                                                            >
                                                                ✏️
                                                            </button>
                                                            <button
                                                                className="action-btn-small"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleDeleteVault(vaultId);
                                                                }}
                                                                title="Delete vault"
                                                            >
                                                                🗑️
                                                            </button>
                                                        </div>
                                                    </div>
                                                    {vault.description && (
                                                        <p className="vault-item-desc">{vault.description}</p>
                                                    )}
                                                    <span className="vault-item-category">{vault.category}</span>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>

                            <div className="vault-items-panel">
                                {selectedVault ? (
                                    <>
                                        <div className="items-header">
                                            <h3>
                                                {vaults.find(v => getId(v) === selectedVault)?.name || 'Vault'} Items
                                            </h3>
                                            <div className="items-header-actions">
                                                {vaultItems.length > 0 && (
                                                    <Button
                                                        class="download-csv-btn"
                                                        text="📥 Download CSV"
                                                        click={handleDownloadCSV}
                                                    />
                                                )}
                                                <Button
                                                    class="add-item-btn"
                                                    text={showItemForm ? "Cancel" : "+ Add Item"}
                                                    click={() => {
                                                        setShowItemForm(!showItemForm);
                                                        setEditingItem(null);
                                                        setNewItem({
                                                            name: '',
                                                            link: '',
                                                            username: '',
                                                            password: '',
                                                            notes: ''
                                                        });
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        {showItemForm && (
                                            <div className="item-form">
                                                <form onSubmit={editingItem ? handleUpdateItem : handleCreateItem}>
                                                    <div className="form-row">
                                                        <div className="form-group">
                                                            <label>Item Name *</label>
                                                            <Input
                                                                type="text"
                                                                name="name"
                                                                class="form-input"
                                                                holder="Enter item name"
                                                                value={newItem.name}
                                                                onChange={handleItemInputChange}
                                                            />
                                                        </div>
                                                        <div className="form-group">
                                                            <label>Link/URL</label>
                                                            <Input
                                                                type="url"
                                                                name="link"
                                                                class="form-input"
                                                                holder="https://example.com"
                                                                value={newItem.link}
                                                                onChange={handleItemInputChange}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="form-row">
                                                        <div className="form-group">
                                                            <label>Username</label>
                                                            <Input
                                                                type="text"
                                                                name="username"
                                                                class="form-input"
                                                                holder="Enter username"
                                                                value={newItem.username}
                                                                onChange={handleItemInputChange}
                                                            />
                                                        </div>
                                                        <div className="form-group">
                                                            <label>Password</label>
                                                            <div className="password-input-wrapper">
                                                                <Input
                                                                    type={showPassword['new'] ? "text" : "password"}
                                                                    name="password"
                                                                    class="form-input"
                                                                    holder="Enter password"
                                                                    value={newItem.password}
                                                                    onChange={handleItemInputChange}
                                                                />
                                                                <button
                                                                    type="button"
                                                                    className="toggle-password-btn"
                                                                    onClick={() => togglePasswordVisibility('new')}
                                                                >
                                                                    {showPassword['new'] ? '🙈' : '👁️'}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="form-group">
                                                        <label>Notes</label>
                                                        <textarea
                                                            name="notes"
                                                            className="form-input form-textarea"
                                                            placeholder="Additional notes..."
                                                            value={newItem.notes}
                                                            onChange={handleItemInputChange}
                                                            rows="3"
                                                        />
                                                    </div>
                                                    <div className="form-actions">
                                                        <Button
                                                            type="submit"
                                                            class="submit-btn"
                                                            text={editingItem ? "Update Item" : "Add Item"}
                                                        />
                                                    </div>
                                                </form>
                                            </div>
                                        )}

                                        <div className="items-list">
                                            {vaultItems.length === 0 ? (
                                                <div className="empty-state">
                                                    <div className="empty-icon">🔐</div>
                                                    <h3>No items in this vault</h3>
                                                    <p>Add your first item to get started!</p>
                                                </div>
                                            ) : (
                                                vaultItems.map(item => {
                                                    const itemId = getId(item);
                                                    return (
                                                        <div key={itemId} className="item-card">
                                                            <div className="item-header">
                                                                <h4>{item.name}</h4>
                                                                <div className="item-actions">
                                                                    <button
                                                                        className="action-btn"
                                                                        onClick={() => handleEditItem(item)}
                                                                        title="Edit item"
                                                                    >
                                                                        ✏️
                                                                    </button>
                                                                    <button
                                                                        className="action-btn"
                                                                        onClick={() => handleDeleteItem(itemId)}
                                                                        title="Delete item"
                                                                    >
                                                                        🗑️
                                                                    </button>
                                                                </div>
                                                            </div>
                                                            {item.link && (
                                                                <div className="item-field">
                                                                    <label>Link:</label>
                                                                    <div className="field-value">
                                                                        <a href={item.link} target="_blank" rel="noopener noreferrer">
                                                                            {item.link}
                                                                        </a>
                                                                        <button
                                                                            className="copy-btn"
                                                                            onClick={() => copyToClipboard(item.link)}
                                                                            title="Copy link"
                                                                        >
                                                                            📋
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            )}
                                                            {item.username && (
                                                                <div className="item-field">
                                                                    <label>Username:</label>
                                                                    <div className="field-value">
                                                                        <span>{item.username}</span>
                                                                        <button
                                                                            className="copy-btn"
                                                                            onClick={() => copyToClipboard(item.username)}
                                                                            title="Copy username"
                                                                        >
                                                                            📋
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            )}
                                                            {item.password && (
                                                                <div className="item-field">
                                                                    <label>Password:</label>
                                                                    <div className="field-value">
                                                                        <span>{showPassword[itemId] ? item.password : '••••••••'}</span>
                                                                        <button
                                                                            className="toggle-password-btn"
                                                                            onClick={() => togglePasswordVisibility(itemId)}
                                                                            title={showPassword[itemId] ? "Hide password" : "Show password"}
                                                                        >
                                                                            {showPassword[itemId] ? '🙈' : '👁️'}
                                                                        </button>
                                                                        <button
                                                                            className="copy-btn"
                                                                            onClick={() => copyToClipboard(item.password)}
                                                                            title="Copy password"
                                                                        >
                                                                            📋
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            )}
                                                            {item.notes && (
                                                                <div className="item-field">
                                                                    <label>Notes:</label>
                                                                    <div className="field-value">
                                                                        <span>{item.notes}</span>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })
                                            )}
                                        </div>
                                    </>
                                ) : (
                                    <div className="empty-state">
                                        <div className="empty-icon">🔐</div>
                                        <h3>Select a vault</h3>
                                        <p>Choose a vault from the sidebar to view or add items</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Vault;
