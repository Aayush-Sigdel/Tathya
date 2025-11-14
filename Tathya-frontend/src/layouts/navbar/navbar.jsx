// layouts/navbar/navbar.jsx
import React, { useState } from 'react';
import { Menu, User, Search } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import styles from './navbar.module.css';

export default function Navbar() {
    const [activeNav, setActiveNav] = useState('Home');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const location = useLocation();

    // Separate navigation items with names and paths
    const navItems = [
        { name: 'Home', path: '/' },
        { name: 'News', path: '/news' },
        { name: 'Blindspot', path: '/pages' },
        { name: 'Contact', path: '/contact' },
        { name: 'About', path: '/about' },
    ];

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const getCurrentActiveNav = () => {
        const currentItem = navItems.find(
            (item) => item.path === location.pathname
        );
        return currentItem ? currentItem.name : 'Home';
    };

    return (
        <nav className={styles['main-nav-container']}>
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
                <Link
                    to="/profile">
                        <button
                            className={styles['icon-btn']}
                            aria-label="User profile">
                    <       User size={24} />
                        </button>
                </Link>
                {/* <button
                    className={styles['icon-btn']}
                    aria-label="Search">
                    <Search size={24} />
                </button> */}
            </div>
        </nav>
    );
}
