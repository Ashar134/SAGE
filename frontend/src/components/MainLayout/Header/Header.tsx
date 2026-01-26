import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import './HeaderStyle.css';
import profileAvatar from '../../../assets/profile-org.png';

function Header() {
    const { user, logout } = useAuth();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };

        if (isDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isDropdownOpen]);

    const handleLogout = async () => {
        await logout();
    };

    return (
        <>
            <div className="header-container">
                <header className="page-header">
                    <div className="container header-container">
                        <div className="logo-brand">
                            <img className="logo-image" src="./sage-logo.png" alt="Sage-Logo" />
                            <h1 className="brand-name">
                                Sa<span className="brand-highlight">ge</span>
                            </h1>
                        </div>

                        <div className="header-actions">
                            <button className="action-icon">
                                <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m9-9h.01" />
                                </svg>
                                <span className="notification-dot"></span>
                            </button>

                            <div className="profile-dropdown" ref={dropdownRef}>
                                <div
                                    className="profile-avatar"
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                >
                                    <img src={profileAvatar} alt="Profile" />
                                </div>

                                {isDropdownOpen && (
                                    <div className="dropdown-menu">
                                        <div className="dropdown-header">
                                            <div className="dropdown-avatar">
                                                <img src={profileAvatar} alt="Profile" />
                                            </div>
                                            <div className="dropdown-info">
                                                <p className="dropdown-name">
                                                    {user ? `${user.first_name} ${user.last_name}` : 'Ashar Naveed'}
                                                </p>
                                                <p className="dropdown-email">
                                                    {user ? user.email : 'asharnaveed2002@gmail.com'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="dropdown-divider"></div>
                                        <a href="/profile" className="dropdown-item">
                                            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                            <span>My Profile</span>
                                        </a>
                                        <a href="/application" className="dropdown-item">
                                            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                            <span>My Applications</span>
                                        </a>
                                        <div className="dropdown-divider"></div>
                                        <button className="dropdown-item logout-item" onClick={handleLogout}>
                                            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                            </svg>
                                            <span>Logout</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </header>
            </div>
        </>
    );
}

export default Header;