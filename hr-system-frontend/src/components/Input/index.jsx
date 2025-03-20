import React from 'react';
import './style.css';
const Input = ({lable , type , value , onChange, placeholder , width=null}) => {

    return (
        <div >  
        <div className='input-label flex flex-dir-col align-center '>
            <label 
            className='small-text'
             >{lable}</label>
            <input
            className={`input border-rad-eight ${width}`}
             type={type}
             value={value} 
             onChange={onChange}
             placeholder={placeholder}/>
        </div>
        </div>
    );
};

export default Input;