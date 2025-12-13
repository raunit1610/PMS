import React from "react";
import '../Styles/Home.css';

import Header from "./Header"

const Home = (props) => {
    return (
        <div className="home-container">
            <Header />
            <div className="home-content">
                {/* Main content goes here */}
            </div>
        </div>
    );
}

export default Home;