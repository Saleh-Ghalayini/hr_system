import React from 'react';
import { Outlet } from 'react-router-dom';
import "./style.css"

const Profile = () => {
    return (
            <div className='profilebody'> 
            <Outlet />
            </div>
    );
};

export default Profile;