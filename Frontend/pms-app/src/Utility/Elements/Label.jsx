import React from "react";
import '../Styles/Label.css';

const Label = (props) => {
    return(
        <label htmlFor={props.for} className={props.class}>{props.text}</label>
    )
}

export default Label;