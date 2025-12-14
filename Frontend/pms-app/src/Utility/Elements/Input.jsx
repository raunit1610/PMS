import React from "react";
import '../Styles/Input.css';

const Input = (props) => {
    return(
        <input 
            type={props.type} 
            id={props.id} 
            name={props.name} 
            placeholder={props.holder} 
            className={props.class} 
            autoComplete={props.auto} 
            value={props.value} 
            onChange={props.onChange || props.change}
            disabled={props.disabled}
        />
    )
}

export default Input;