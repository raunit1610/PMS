import React from "react";
import '../Styles/Heading1.css';

function Heading1(props){
    return(
        <h1 className={props.class}>{props.heading}</h1>
    )
}

export default Heading1;

{/* <Heading1 class="primary large center" heading="Welcome" />
<Heading1 class="gradient glow animate-in" heading="PMS" />
<Heading1 class="neon interactive" heading="Click Me" />
<Heading1 class="outline shimmer" heading="Shimmer" /> */}