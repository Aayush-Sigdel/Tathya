import React from 'react';
import { CheckCircle, X, AlertCircle } from 'lucide-react';
import styles from './ProfileMetrics.module.css';

const ProfileMetrics = ({ 
    completionPercentage = 0, 
    verificationStatus = 'pending',
    metrics = []
}) => {
    const getStatusColor = (status) => {
        switch(status) {
            case 'verified':
                return '#10b981'; // green
            case 'pending':
                return '#f59e0b'; // yellow
            case 'rejected':
                return '#ef4444'; // red
            default:
                return '#6b7280'; // gray
        }
    };

    const statusColor = getStatusColor(verificationStatus);

    // Calculate the circle circumference
    const radius = 70;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (completionPercentage / 100) * circumference;

    return (
        <div className={styles.metricsCard}>
            <h3 className={styles.metricsTitle}>Complete your profile</h3>
            
            {/* Circular Progress */}
            <div className={styles.circularProgress}>
                <svg width="180" height="180" viewBox="0 0 180 180">
                    {/* Background circle */}
                    <circle
                        cx="90"
                        cy="90"
                        r={radius}
                        fill="none"
                        stroke="#e5e7eb"
                        strokeWidth="12"
                    />
                    {/* Progress circle */}
                    <circle
                        cx="90"
                        cy="90"
                        r={radius}
                        fill="none"
                        stroke={statusColor}
                        strokeWidth="12"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        transform="rotate(-90 90 90)"
                        className={styles.progressCircle}
                    />
                </svg>
                <div className={styles.percentageText}>
                    <span className={styles.percentage}>{completionPercentage}%</span>
                </div>
            </div>

            {/* Metrics List */}
            <div className={styles.metricsList}>
                {metrics.map((metric, index) => (
                    <div key={index} className={styles.metricItem}>
                        <div className={styles.metricIcon}>
                            {metric.completed ? (
                                <CheckCircle size={16} color="#10b981" />
                            ) : (
                                <X size={16} color="#ef4444" />
                            )}
                        </div>
                        <span className={styles.metricLabel}>
                            {metric.label}
                        </span>
                        <span 
                            className={styles.metricPercentage}
                            style={{ 
                                color: metric.completed ? '#10b981' : '#6b7280' 
                            }}
                        >
                            {metric.value}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProfileMetrics;