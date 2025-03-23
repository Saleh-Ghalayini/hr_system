import React from 'react';
import './style.css';
const Input = ({label , type , value , onChange, placeholder , className="", width=null, ...props}) => {

    return (
        <div >  
        <div className='input-label flex flex-dir-col align-center '>
            <label 
            className='small-text label'
             >{label}</label>
            <input
            className={`input border-rad-eight ${width} ${className}`} {...props}
             type={type}
             value={value} 
             onChange={onChange}
             placeholder={placeholder}/>
        </div>
        </div>
    );
};

export default Input;