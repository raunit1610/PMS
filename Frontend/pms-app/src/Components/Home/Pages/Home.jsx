import React from "react";
import { useParams } from 'react-router-dom';
import '../Styles/Home.css';

import Header from "./Header"

const Home = () => {
    const { id } = useParams();
    
    return (
        <div className="home-container">
            <Header />
            <div className="home-content">
                {/* Main content goes here */}
                {/* User ID: {id} */}
            </div>
        </div>
    );
}

export default Home;