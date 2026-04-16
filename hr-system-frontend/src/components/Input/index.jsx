import React from 'react';
import './style.css';

const Input = ({ 
    label, 
    type = "text", 
    value, 
    onChange, 
    placeholder, 
    className = "", 
    width = null, 
    readonly = false,
    disabled = false,
    ...props 
}) => {

    return (
        <div >  
            <div className='input-label flex flex-dir-col align-center '>
                <label className='small-text label'>{label}</label>
                <input
                    className={`input border-rad-eight ${width} ${className} ${readonly || disabled ? 'input-readonly' : ''}`}
                    type={type}
                    value={value} 
                    onChange={readonly || disabled ? undefined : onChange}
                    placeholder={placeholder}
                    readOnly={readonly}
                    disabled={disabled}
                    {...props}
                />
            </div>
        </div>
    );
};

export default Input;
