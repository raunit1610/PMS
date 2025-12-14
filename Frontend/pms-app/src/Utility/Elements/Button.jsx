import React from "react";
import '../Styles/Button.css';

function Button(props){
    return(
        <button 
            type={props.type} 
            className={props.class} 
            onSubmit={props.submit} 
            onClick={props.click}
            disabled={props.disabled}
        >
            {props.text}
        </button>
    )
}

export default Button;

{/* <Button class="primary" text="Click Me" />
<Button class="secondary large" text="Large Button" />
<Button class="outline" text="Outline" />
<Button class="ghost small" text="Ghost" /> */}