import React, { useEffect, useState } from 'react';
import { Icon } from '@iconify/react';
import './style.css';
import { useLocation, useNavigate } from 'react-router-dom';
import { request } from '../../common/request';

const NavBar = () => {
    const ImageBaseUrl = import.meta.env.VITE_Image_Base_URL;
    const [profile_url, setProfile] = useState("/logo.png");
    const navigation = useNavigate();
    const location = useLocation();
    const title = location.pathname.split("/")[1] || "Dashboard";

    const getUrl = async () => {
        try {
            const response = await request({
                method: "GET",
                path: "profile/photo",
            });
            if (response.success && response.data?.photo_url) {
                setProfile(ImageBaseUrl + response.data.photo_url);
            }
        } catch (error) {
            // Keep default avatar on error
        }
    };

    useEffect(() => {
        getUrl();
    }, []);

    return (
        <nav>
            <div className="title poppins">{title}</div>
            <div className='profile-section'>
                <Icon className='icons' icon="bi:bell-fill" width="20" height="20" />
                <Icon className='icons' icon="ic:baseline-settings" width="24" height="24" />
                <img
                    src={profile_url}
                    alt="Profile picture"
                    onClick={() => navigation("/profile/")}
                    onError={(e) => { e.target.src = "/logo.png"; }}
                />
            </div>
        </nav>
    );
};

export default NavBar;
