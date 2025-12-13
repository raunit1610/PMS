import React from "react";
import '../Styles/Button.css';

function Button(props){
    return(
        <button className={props.class} onSubmit={props.submit} onClick={props.click}>{props.text}</button>
    )
}

export default Button;

{/* <Button class="primary" text="Click Me" />
<Button class="secondary large" text="Large Button" />
<Button class="outline" text="Outline" />
<Button class="ghost small" text="Ghost" /> */}