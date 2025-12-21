import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import '../Styles/Header.css';

import Heading1 from "../../../Utility/Elements/Heading1";
import Navigation from "../../../Utility/Elements/Navigation";

function Header(props){
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const menuRef = useRef(null);
    const navigate = useNavigate();

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setUserMenuOpen(false);
            }
        };

        if (userMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [userMenuOpen]);

    const handleLogout = () => {
        localStorage.clear();
        navigate('/auth/login');
    };

    return (
        <div className="header">
            <div className="header-content">
                <Heading1 class="gradient glow animate-in" heading={props.userName}/>
                {/* Show menu on all screen sizes */}
                <nav className="header-nav">
                    <div className="header-user-menu" ref={menuRef}>
                        <button 
                            className="user-menu-button"
                            onClick={() => setUserMenuOpen(!userMenuOpen)}
                            aria-label="User menu"
                        >
                            <div className="user-avatar-header">
                                <span className="user-avatar-icon">👤</span>
                            </div>
                            <span className="user-menu-text">Account</span>
                            <span className={`user-menu-arrow ${userMenuOpen ? 'open' : ''}`}>▼</span>
                        </button>
                        
                        {userMenuOpen && (
                            <div className="user-menu-dropdown">
                                <button
                                 className="user-menu-item logout-item"
                                 onClick={() => navigate('/auth/profile')}
                                >
                                
                                    <span className="menu-item-icon">👤</span>
                                    <span>My Profile</span>
                                </button>
                                <button 
                                    className="user-menu-item logout-item"
                                    onClick={handleLogout}
                                >
                                    <span className="menu-item-icon">🚪</span>
                                    <span>Logout</span>
                                </button>
                            </div>
                        )}
                    </div>
                </nav>
            </div>
        </div>
    )
}

export default Header;