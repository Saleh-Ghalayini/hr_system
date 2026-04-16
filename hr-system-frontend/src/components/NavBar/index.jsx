import React, { useEffect, useRef, useState } from 'react';
import { Icon } from '@iconify/react';
import './style.css';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../context/AuthContext';

const formatTitle = (pathname) => {
    const segment = pathname.split('/')[1] || 'dashboard';
    return segment
        .split('-')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
};

const getInitials = (first, last) =>
    `${first?.[0] ?? ""}${last?.[0] ?? ""}`.toUpperCase();

const NavBar = () => {
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [showNotifModal, setShowNotifModal] = useState(false);
    const profileRef = useRef(null);
    const navigation = useNavigate();
    const location = useLocation();
    const title = formatTitle(location.pathname);
    const { user, logout } = useAuthContext();

    // Close profile menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (profileRef.current && !profileRef.current.contains(e.target)) {
                setShowProfileMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Close notification modal on Escape
    useEffect(() => {
        if (!showNotifModal) return;
        const handleEsc = (e) => { if (e.key === 'Escape') setShowNotifModal(false); };
        document.addEventListener('keydown', handleEsc);
        return () => document.removeEventListener('keydown', handleEsc);
    }, [showNotifModal]);

    const handleSettings = () => {
        setShowProfileMenu(false);
        navigation('/profile/basicinfo');
    };

    const handleNotifications = () => {
        setShowProfileMenu(false);
        setShowNotifModal(true);
    };

    const handleLogout = () => {
        setShowProfileMenu(false);
        logout();
    };

    return (
        <>
            <nav>
                <div className="nav-title poppins">{title}</div>
                <div className="profile-section">
                    <div className="profile-menu-wrapper" ref={profileRef}>
                        <div
                            className="nav-avatar nav-avatar-initials"
                            onClick={() => setShowProfileMenu((v) => !v)}
                        >
                            {getInitials(user?.first_name, user?.last_name)}
                        </div>
                        {showProfileMenu && (
                            <div className="profile-dropdown">
                                <div className="profile-dropdown-header">
                                    <div className="profile-dropdown-avatar profile-dropdown-initials">
                                        {getInitials(user?.first_name, user?.last_name)}
                                    </div>
                                    <div className="profile-dropdown-info">
                                        <span className="profile-dropdown-name">
                                            {user?.first_name} {user?.last_name}
                                        </span>
                                        <span className="profile-dropdown-role">{user?.role}</span>
                                    </div>
                                </div>

                                <div className="profile-dropdown-divider" />

                                <div className="profile-dropdown-items">
                                    <button className="profile-dropdown-item" onClick={handleSettings}>
                                        <Icon icon="mdi:cog-outline" width="17" height="17" />
                                        <span>Settings</span>
                                    </button>
                                    <button className="profile-dropdown-item" onClick={handleNotifications}>
                                        <Icon icon="mdi:bell-outline" width="16" height="16" />
                                        <span>Notifications</span>
                                    </button>
                                </div>

                                <div className="profile-dropdown-divider" />

                                <div className="profile-dropdown-items">
                                    <button className="profile-dropdown-item profile-dropdown-logout" onClick={handleLogout}>
                                        <Icon icon="mdi:logout" width="17" height="17" />
                                        <span>Logout</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </nav>

            {showNotifModal && (
                <div className="notif-modal-overlay" onClick={() => setShowNotifModal(false)}>
                    <div className="notif-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="notif-modal-header">
                            <h3>Notifications</h3>
                            <button className="notif-modal-close" onClick={() => setShowNotifModal(false)}>
                                <Icon icon="mdi:close" width="20" height="20" />
                            </button>
                        </div>
                        <div className="notif-modal-body">
                            <Icon icon="mdi:bell-off-outline" width="40" height="40" color="#d1d5db" />
                            <p>No notifications yet</p>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default NavBar;
