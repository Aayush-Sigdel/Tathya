import React, { useEffect, useState } from 'react';

const DotGridBackground = ({
    children,
    dotSize = 2,
    dotSpacing = 20,
    dotColor = '#e5e7eb',
    backgroundColor = '#ffffff',
    darkDotColor = '#374151',
    darkBackgroundColor = '#111827',
    className = '',
}) => {
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        const checkDark = () =>
            setIsDark(document.documentElement.classList.contains('dark'));
        checkDark();
        const observer = new MutationObserver(checkDark);
        observer.observe(document.documentElement, { attributes: true });
        return () => observer.disconnect();
    }, []);

    const activeDotColor = isDark ? darkDotColor : dotColor;
    const activeBgColor = isDark ? darkBackgroundColor : backgroundColor;
    const dotPattern = `radial-gradient(circle, ${activeDotColor} ${dotSize}px, transparent ${dotSize}px)`;

    return (
        <div
            className={`min-h-screen w-full relative ${className}`}
            style={{
                backgroundColor: activeBgColor,
                backgroundImage: dotPattern,
                backgroundSize: `${dotSpacing}px ${dotSpacing}px`,
                backgroundPosition: '0 0',
                transition: 'background-color 0.3s, color 0.3s',
            }}>
            <div className="relative z-10 w-full h-full">{children}</div>
        </div>
    );
};

export default DotGridBackground;
