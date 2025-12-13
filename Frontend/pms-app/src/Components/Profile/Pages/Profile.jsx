import React from "react";
import '../Styles/Profile.css';
import Header from "../../Home/Pages/Header";

function Profile(props){
    return(
        <div className="home-container">
            <Header />
            <div className="home-content">
                <p>Profile</p>
            </div>
        </div>
    )
}

export default Profile;