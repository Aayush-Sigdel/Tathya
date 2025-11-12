// layouts/navbar/navbar.jsx
import React, { useState } from 'react';
import { Menu, User, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import './navbar.css';

export default function Navbar() {
    const [activeNav, setActiveNav] = useState('Home');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const navItems = [
        { name: 'Home', path: '/' },
        { name: 'News', path: '/about' },
        { name: 'Contact Us', path: '/contact' },
        { name: 'About Us', path: '/about-us' },
    ];

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    return (
        <nav className="main-nav-container">
            <button
                className="menu-btn"
                onClick={toggleMobileMenu}>
                <Menu size={24} />
            </button>

            <ul
                className={`nav-links-container ${
                    isMobileMenuOpen ? 'mobile-open' : ''
                }`}>
                {navItems.map((item) => (
                    <li
                        key={item.name}
                        className="nav-item">
                        <Link
                            to={item.path}
                            className={`nav-link ${
                                activeNav === item.name ? 'nav-link-active' : ''
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

            <div className="nav-right-container">
                <button
                    className="icon-btn"
                    aria-label="User Profile">
                    <User size={24} />
                </button>
                <button
                    className="icon-btn"
                    aria-label="Search">
                    <Search size={24} />
                </button>
            </div>
        </nav>
    );
}
