// layouts/navbar/navbar.jsx
import React, { useState, useEffect } from 'react';
import { Menu, User, Search, LogOut } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import styles from './navbar.module.css';

export default function Navbar() {
    const [activeNav, setActiveNav] = useState('Home');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [userName, setUserName] = useState('');
    const location = useLocation();
    const navigate = useNavigate();

    // Separate navigation items with names and paths
    const navItems = [
        { name: 'Home', path: '/' },
        { name: 'News', path: '/news' },
        { name: 'Blindspot', path: '/blindspot' },
        { name: 'Contact', path: '/contact' },
        { name: 'About', path: '/about' },
    ];

    // Get user name from localStorage on component mount
    useEffect(() => {
        const storedUserName = localStorage.getItem('userName');
        if (storedUserName) {
            setUserName(storedUserName);
        }

        // Listen for storage events to update username when it changes
        const handleStorageChange = () => {
            const updatedUserName = localStorage.getItem('userName');
            setUserName(updatedUserName || '');
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const getCurrentActiveNav = () => {
        const currentItem = navItems.find(
            (item) => item.path === location.pathname
        );
        return currentItem ? currentItem.name : 'Home';
    };

    const handleLogout = () => {
        // Clear all authentication data
        localStorage.removeItem('accessToken');
        localStorage.removeItem('userName');
        localStorage.removeItem('userEmail');

        // Trigger storage event to update authentication state
        window.dispatchEvent(new Event('storage'));

        // Navigate to auth page
        navigate('/auth');
    };

    return (
        <nav className={styles['main-nav-container']}>
            {/* Mobile menu button (commented out but kept for future use) */}
            {/* <button
                className={styles['menu-btn']}
                onClick={toggleMobileMenu}
                aria-label="Toggle mobile menu">
                <Menu size={24} />
            </button> */}

            <ul
                className={`${styles['nav-links-container']} ${
                    isMobileMenuOpen ? styles['mobile-open'] : ''
                }`}>
                {navItems.map((item) => (
                    <li
                        key={item.name}
                        className={styles['nav-item']}>
                        <Link
                            to={item.path}
                            className={`${styles['nav-link']} ${
                                location.pathname === item.path
                                    ? styles['nav-link-active']
                                    : ''
                            }`}
                            onClick={() => {
                                setActiveNav(item.name);
                                setIsMobileMenuOpen(false);
                            }}>
                            {item.name}
                        </Link>
                    </li>
                ))}
            </ul>

            <div className={styles['nav-right-container']}>
                {/* Combined user section with profile link and logout */}
                <div className={styles['nav-user-section']}>
                    {/* Clickable profile section */}
                    <Link
                        to="/profile"
                        className={styles['nav-user-info']}
                        title="View Profile"
                        aria-label="User profile">
                        <User size={18} />
                        <span className={styles['username']}>
                            {userName || 'User'}
                        </span>
                    </Link>

                    {/* Logout button */}
                    <div className={styles['nav-user-actions']}>
                        <button
                            onClick={handleLogout}
                            className={styles['logout-button']}
                            title="Logout"
                            aria-label="Logout">
                            <LogOut size={18} />
                        </button>
                    </div>
                </div>

                {/* Search button (commented out but kept for future use) */}
                {/* <button
                    className={styles['icon-btn']}
                    aria-label="Search">
                    <Search size={24} />
                </button> */}
            </div>
        </nav>
    );
}
