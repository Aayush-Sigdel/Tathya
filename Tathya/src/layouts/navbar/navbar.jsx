// layouts/navbar/navbar.jsx
import React from 'react';
import { Link } from 'react-router-dom';

export default function Navbar() {
    return (
        <nav style={{ padding: '10px', backgroundColor: '#333' }}>
            <Link
                to="/"
                style={{ color: 'white', marginRight: '10px' }}>
                Home
            </Link>
            <Link
                to="/about"
                style={{ color: 'white' }}>
                About
            </Link>
        </nav>
    );
}
