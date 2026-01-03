import React, { useState, useEffect } from "react";
import { useParams, Link } from 'react-router-dom';
import '../Styles/Home.css';

import Header from "./Header"

const Home = () => {
    const { id } = useParams();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [userName, setUserName] = useState('');
    const [userId, setUserId] = useState('');
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
                {/* Left Sidebar Navigation */}
                <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
                    <div className="sidebar-logo">LT</div>
                    <nav className="sidebar-nav">
                        <Link to={`/feature/home/${userId}`} className="sidebar-item active" onClick={closeSidebar}>
                            <span className="sidebar-icon">🏠</span>
                            <span className="sidebar-text">Home</span>
                        </Link>
                        <Link to={`/feature/money/${userId}`} className="sidebar-item" onClick={closeSidebar}>
                            <span className="sidebar-icon">🏢</span>
                            <span className="sidebar-text">Money</span>
                        </Link>
                    </nav>
                    <div className="sidebar-menu" onClick={closeSidebar}>☰</div>
                </div>

                {/* Main Content Area */}
                <div className="home-content">
                    {/* Sub Header */}
                    <Header userName={userName} />
                    
                    {/* Main content goes here */}
                    {/* User ID: {id} */}
                </div>
            </div>
        </div>
    );
}

export default Home;