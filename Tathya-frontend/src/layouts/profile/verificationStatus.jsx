import React from 'react';
import { Shield, CheckCircle, Clock, XCircle } from 'lucide-react';
import styles from './VerificationStatus.module.css';

const VerificationStatus = ({ 
    status = 'pending', 
    verificationDate = null,
    message = '' 
}) => {
    const getStatusConfig = () => {
        switch(status) {
            case 'verified':
                return {
                    color: '#64ad5a',
                    bgColor: '#d1fae5',
                    icon: <CheckCircle size={20} />,
                    label: 'Verified',
                    text: 'Your profile has been verified'
                };
            case 'pending':
                return {
                    color: '#f5c242',
                    bgColor: '#fef3c7',
                    icon: <Clock size={20} />,
                    label: 'Pending',
                    text: 'Verification in progress'
                };
            case 'rejected':
                return {
                    color: '#e35040',
                    bgColor: '#fee2e2',
                    icon: <XCircle size={20} />,
                    label: 'Rejected',
                    text: 'Verification was rejected'
                };
            default:
                return {
                    color: '#6b7280',
                    bgColor: '#f3f4f6',
                    icon: <Shield size={20} />,
                    label: 'Not Started',
                    text: 'Start verification process'
                };
        }
    };

    const config = getStatusConfig();

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <div 
            className={styles.statusCard}
            style={{ 
                backgroundColor: config.bgColor,
                borderColor: config.color 
            }}
        >
            <div className={styles.statusHeader}>
                <div 
                    className={styles.statusIcon}
                    style={{ color: config.color }}
                >
                    {config.icon}
                </div>
                <div className={styles.statusInfo}>
                    <h4 
                        className={styles.statusLabel}
                        style={{ color: config.color }}
                    >
                        {config.label}
                    </h4>
                    <p className={styles.statusText}>
                        {message || config.text}
                    </p>
                    {verificationDate && status === 'verified' && (
                        <p className={styles.statusDate}>
                            Verified on {formatDate(verificationDate)}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VerificationStatus;