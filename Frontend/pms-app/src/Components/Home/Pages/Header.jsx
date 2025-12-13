import React from "react";
import { Link } from 'react-router-dom';

import '../Styles/Header.css';

import Heading1 from "../../../Utility/Elements/Heading1";

function Header(){
    return (
        <div className="header">
            <div className="header-content">
                <Heading1 class="gradient glow animate-in" heading="PMS"/>
                <nav className="header-nav">
                    {/* Navigation links can be added here */}
                    <Link to="/profile" className="nav-link">
                        Profile
                    </Link>
                </nav>
            </div>
        </div>
    )
}

export default Header;