import React from "react";
import '../Styles/Paragraph.css';

const Paragraph = (props) => {
    return(
        <p className={props.class}>{props.para}</p>
    )
}

export default Paragraph;