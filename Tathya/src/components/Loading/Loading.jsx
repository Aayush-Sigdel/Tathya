import React from 'react';

const Loading = ({ size = 'small', className = '' }) => {
    const sizeStyles = {
        small: { width: '16px', height: '16px' },
        medium: { width: '24px', height: '24px' },
        large: { width: '32px', height: '32px' },
    };

    return (
        <div
            className={`loading-spinner ${className}`}
            style={{
                ...sizeStyles[size],
                border: '2px solid #f3f4f6',
                borderTop: '2px solid #3b82f6',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                display: 'inline-block',
            }}
        />
    );
};

export default Loading;
