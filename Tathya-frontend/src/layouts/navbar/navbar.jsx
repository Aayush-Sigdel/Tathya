// layouts/navbar/navbar.jsx
import React, { useState } from 'react';
import { Menu, User, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import styles from './navbar.module.css';

export default function Navbar() {
    const [activeNav, setActiveNav] = useState('Home');
    const navItems = ['Home', 'Pages', 'Contact', 'About'];

    return (
        <nav className={styles['main-nav-container']}>
            <button className={styles['menu-btn']}>
                <Menu size={24} />
            </button>

            <ul className={styles['nav-links-container']}>
                {navItems.map((item) => (
                    <li
                        key={item}
                        className={styles['nav-item']}>
                        <Link
                            to={item.toLowerCase().replace(/\s+/g, '')}
                            className={`${styles['nav-link']} ${
                                activeNav === item
                                    ? styles['nav-link-active']
                                    : ''
                            }`}
                            onClick={() => setActiveNav(item)}>
                            {item}
                        </Link>
                    </li>
                ))}
            </ul>

            <div className={styles['nav-right-container']}>
                <button className={styles['icon-btn']}>
                    <User size={24} />
                </button>
                <button className={styles['icon-btn']}>
                    <Search size={24} />
                </button>
            </div>
        </nav>
    );
}
