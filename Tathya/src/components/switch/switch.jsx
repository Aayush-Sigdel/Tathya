import React, { useState, useEffect } from 'react';
import { Sun, Moon, SunIcon } from 'lucide-react';

const ThemeSwitch = ({ className = '' }) => {
    // const [isDark, setIsDark] = useState(false);
    // useEffect(() => {
    //     const savedTheme = localStorage.getItem('theme');
    //     const prefersDark = window.matchMedia(
    //         '(prefers-color-scheme: dark)'
    //     ).matches;

    //     if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
    //         setIsDark(true);
    //         document.documentElement.classList.add('dark');
    //     } else {
    //         setIsDark(false);
    //         document.documentElement.classList.remove('dark');
    //     }
    // }, []);
    // const handleModeChange = () => {
    //     const newMode = !isDark;
    //     setIsDark(newMode);

    //     if (newMode) {
    //         document.documentElement.classList.add('dark');
    //         localStorage.setItem('theme', 'dark');
    //     } else {
    //         document.documentElement.classList.remove('dark');
    //         localStorage.setItem('theme', 'light');
    //     }
    // };
    return (
        <div
            className={`${className}`}
            style={{ display: 'flex', gap: 10 }}>
            <div
                className="switch-body relative transition-all duration-300 ease-in-out"
                style={{
                    width: 50,
                    height: 24,
                    borderRadius: 40,
                    backgroundColor: isDark ? '#374151' : '#e5e7eb',
                    padding: '3px',
                    boxShadow: isDark
                        ? '0 0 8px 2px #37415155'
                        : '0 0 8px 2px #e5e7eb55',
                    cursor: 'pointer',
                    transition: 'background-color 0.3s, box-shadow 0.3s',
                }}
                onClick={handleModeChange}
                onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = isDark
                        ? '0 0 16px 4px #6366f155'
                        : '0 0 16px 4px #38bdf855';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = isDark
                        ? '0 0 8px 2px #37415155'
                        : '0 0 8px 2px #e5e7eb55';
                }}>
                <div
                    className="circle transition-all duration-500 ease-in-out"
                    style={{
                        alignSelf: 'center',
                        width: 18,
                        height: 18,
                        borderRadius: 40,
                        backgroundColor: isDark ? '#ffffffff' : '#2e3035ff',
                        transform: isDark
                            ? 'translateX(26px) scale(1.1)'
                            : 'translateX(0px) scale(1.1)',
                        boxShadow: '0 2px 4px rgba(223, 214, 214, 0.2)',
                        transition:
                            'transform 0.4s cubic-bezier(.68,-0.55,.27,1.55), background-color 0.3s',
                    }}></div>
            </div>
        </div>
    );
};

export default ThemeSwitch;
