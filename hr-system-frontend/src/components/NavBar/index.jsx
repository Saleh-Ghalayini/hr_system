import React from 'react';
import { Icon } from '@iconify/react';
import './style.css';
import { useLocation } from 'react-router-dom';
const NavBar = () => {
    const location = useLocation();
    const title = location.pathname.split("/")[1] || "Dashboard";
    return (
        <nav>
            <div className="title poppins">{title}</div>
            <div className='profile-section'>
            <Icon className='icons' icon="bi:bell-fill" width="20" height="20" />
            <Icon className='icons' icon="ic:baseline-settings" width="24" height="24" />
            <img src="logo.png" alt="Profile picture" onClick={()=>console.log("progile")} />            
            </div>
        </nav>
    );
};

export default NavBar;