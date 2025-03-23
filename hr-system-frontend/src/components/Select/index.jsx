import React from 'react';

const Select = ({label , className,value,onChange,options }) => {
    return (
        <div >
        <div className='input-label flex flex-dir-col align-center '>
             <label 
            className='small-text label'
             >{label}</label>
            <select 
            className={`border-rad-eight  ${className}`} 
            value={value}
            onChange={onChange}
            >
            {options.map((option, index) => (
          <option key={index} value={option.value}>
            {option.label}
          </option>
             ))}
            </select>
        </div>
        </div>
    );
};

export default Select;