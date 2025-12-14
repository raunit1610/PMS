import React from "react";
import { Link } from 'react-router-dom';

import '../Styles/Navigation.css'

const Navigation = (props) => {
    return (
        <Link to={props.path} className={`navigation-link${props.class ? ` ${props.class}` : ''}`}>
            {props.text}
        </Link>
    )
}

export default Navigation;