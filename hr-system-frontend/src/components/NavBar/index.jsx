import React, { useEffect, useRef, useState } from 'react';
import { Icon } from '@iconify/react';
import './style.css';
import { useLocation, useNavigate } from 'react-router-dom';
import { request } from '../../common/request';

const formatTitle = (pathname) => {
    const segment = pathname.split('/')[1] || 'dashboard';
    return segment
        .split('-')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
};

const NavBar = () => {
    const ImageBaseUrl = import.meta.env.VITE_Image_Base_URL;
    const [profile_url, setProfile] = useState('/logo.png');
    const [showNotifications, setShowNotifications] = useState(false);
    const notifRef = useRef(null);
    const navigation = useNavigate();
    const location = useLocation();
    const title = formatTitle(location.pathname);

    const getUrl = async () => {
        try {
            const response = await request({ method: 'GET', path: 'profile/photo' });
            if (response.success && response.data?.photo_url) {
                setProfile(ImageBaseUrl + response.data.photo_url);
            }
        } catch {
            // Keep default avatar
        }
    };

    // Close notification dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (notifRef.current && !notifRef.current.contains(e.target)) {
                setShowNotifications(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        getUrl();
    }, []);

    return (
        <nav>
            <div className="nav-title poppins">{title}</div>
            <div className="profile-section">
                {/* Notifications */}
                <div className="notif-wrapper" ref={notifRef}>
                    <button
                        className="nav-icon-btn"
                        onClick={() => setShowNotifications((v) => !v)}
                        title="Notifications"
                    >
                        <Icon icon="bi:bell-fill" width="18" height="18" />
                    </button>
                    {showNotifications && (
                        <div className="notif-dropdown">
                            <div className="notif-header">Notifications</div>
                            <div className="notif-empty">
                                <Icon icon="bi:bell-slash" width="28" height="28" />
                                <p>No notifications yet</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Settings */}
                <button
                    className="nav-icon-btn"
                    onClick={() => navigation('/profile/basicinfo')}
                    title="Settings"
                >
                    <Icon icon="ic:baseline-settings" width="20" height="20" />
                </button>

                {/* Profile avatar */}
                <img
                    src={profile_url}
                    alt="Profile picture"
                    className="nav-avatar"
                    onClick={() => navigation('/profile/')}
                    onError={(e) => { e.target.src = '/logo.png'; }}
                />
            </div>
        </nav>
    );
};

export default NavBar;
