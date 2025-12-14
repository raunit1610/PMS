import React from "react";

import '../Styles/Header.css';

import Heading1 from "../../../Utility/Elements/Heading1";
import Navigation from "../../../Utility/Elements/Navigation";

function Header(){
    return (
        <div className="header">
            <div className="header-content">
                <Heading1 class="gradient glow animate-in" heading="PMS"/>
                <nav className="header-nav">
                    {/* Navigation links can be added here */}
                    <Navigation path="/profile" className="nav-link" text="Profile"/>
                    <span
                        className="nav-link"
                        style={{ cursor: "pointer" }}
                        onClick={() => {
                            localStorage.clear();
                        }}
                    >
                        <Navigation path="/auth/login" className="nav-link" text="Logout"/>
                    </span>
                </nav>
            </div>
        </div>
    )
}

export default Header;