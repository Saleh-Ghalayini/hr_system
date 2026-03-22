import React from 'react';
import './style.css';

const Select = ({ label, className = "", value, onChange, options, ...props }) => {
    return (
        <div className="select-wrapper">
            <div className="select-field">
                {label && <label className="select-label">{label}</label>}
                <select
                    className={`select-input ${className}`}
                    value={value}
                    onChange={onChange}
                    {...props}
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
