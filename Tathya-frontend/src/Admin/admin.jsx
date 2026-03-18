import React, { useState, useEffect } from 'react';
import { User, Calendar, FileText, Check, X, RefreshCw } from 'lucide-react';

const AdminDashboard = () => {
    const [pendingKyc, setPendingKyc] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState(null);

    const API_BASE_URL = 'http://localhost:8080';

    // Fetch pending KYC requests
    const fetchPendingKyc = async () => {
        try {
            setLoading(true);
            console.log('Fetching pending KYC requests...');

            const response = await fetch(`${API_BASE_URL}/admin/kyc/pending`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem(
                        'accessToken'
                    )}`,
                },
                credentials: 'include',
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Pending KYC requests:', data);
                setPendingKyc(data);
            } else {
                console.error('Failed to fetch pending KYC:', response.status);
                alert('Failed to fetch pending KYC requests');
            }
        } catch (error) {
            console.error('Error fetching pending KYC:', error);
            alert('Network error while fetching data');
        } finally {
            setLoading(false);
        }
    };

    // Handle KYC verification
    const handleKycAction = async (userId, action) => {
        try {
            setProcessingId(userId);
            console.log(`${action} KYC for user:`, userId);

            const response = await fetch(
                `${API_BASE_URL}/admin/kyc/verify?userId=${userId}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${localStorage.getItem(
                            'accessToken'
                        )}`,
                    },
                    credentials: 'include',
                }
            );

            if (response.ok) {
                const message = await response.text();
                console.log('KYC action successful:', message);
                alert(`KYC ${action} successful!`);

                // Refresh the list
                fetchPendingKyc();
            } else {
                console.error(`Failed to ${action} KYC:`, response.status);
                alert(`Failed to ${action} KYC`);
            }
        } catch (error) {
            console.error(`Error ${action} KYC:`, error);
            alert(`Network error during KYC ${action}`);
        } finally {
            setProcessingId(null);
        }
    };

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return 'Not provided';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    // Load data on component mount
    useEffect(() => {
        fetchPendingKyc();
    }, []);

    return (
        <div style={styles.container}>
            {/* Header */}
            <div style={styles.header}>
                <div style={styles.headerContent}>
                    <h1 style={styles.title}>Admin Dashboard</h1>
                    <p style={styles.subtitle}>
                        Manage KYC Verification Requests
                    </p>
                </div>
                <button
                    onClick={fetchPendingKyc}
                    style={styles.refreshButton}
                    disabled={loading}>
                    <RefreshCw
                        size={16}
                        style={{ marginRight: '8px' }}
                    />
                    Refresh
                </button>
            </div>

            {/* Stats */}
            <div style={styles.stats}>
                <div style={styles.statCard}>
                    <FileText
                        size={24}
                        style={styles.statIcon}
                    />
                    <div>
                        <h3 style={styles.statNumber}>{pendingKyc.length}</h3>
                        <p style={styles.statLabel}>Pending Requests</p>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div style={styles.content}>
                {loading ? (
                    <div style={styles.loadingState}>
                        <RefreshCw
                            size={32}
                            style={styles.spinner}
                        />
                        <p>Loading pending KYC requests...</p>
                    </div>
                ) : pendingKyc.length === 0 ? (
                    <div style={styles.emptyState}>
                        <FileText
                            size={48}
                            style={styles.emptyIcon}
                        />
                        <h3>No Pending Requests</h3>
                        <p>All KYC requests have been processed</p>
                    </div>
                ) : (
                    <div style={styles.requestsList}>
                        <h2 style={styles.sectionTitle}>Recent KYC Requests</h2>
                        {pendingKyc.map((user) => (
                            <div
                                key={user.id}
                                style={styles.requestCard}>
                                <div style={styles.userInfo}>
                                    <div style={styles.userIcon}>
                                        <User size={20} />
                                    </div>
                                    <div style={styles.userDetails}>
                                        <h3 style={styles.userName}>
                                            {user.name}
                                        </h3>
                                        <p style={styles.userEmail}>
                                            {user.email}
                                        </p>
                                        <div style={styles.userMeta}>
                                            <span style={styles.metaItem}>
                                                <Calendar size={14} />
                                                DOB:{' '}
                                                {formatDate(user.dateOfBirth)}
                                            </span>
                                            {user.kycDocumentPath && (
                                                <span style={styles.metaItem}>
                                                    <FileText size={14} />
                                                    Doc: {user.kycDocumentPath}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div style={styles.actions}>
                                    <button
                                        onClick={() =>
                                            handleKycAction(user.id, 'approve')
                                        }
                                        disabled={processingId === user.id}
                                        style={{
                                            ...styles.actionButton,
                                            ...styles.approveButton,
                                        }}>
                                        <Check
                                            size={16}
                                            style={{ marginRight: '4px' }}
                                        />
                                        {processingId === user.id
                                            ? 'Processing...'
                                            : 'Accept'}
                                    </button>
                                    <button
                                        onClick={() =>
                                            handleKycAction(user.id, 'reject')
                                        }
                                        disabled={processingId === user.id}
                                        style={{
                                            ...styles.actionButton,
                                            ...styles.rejectButton,
                                        }}>
                                        <X
                                            size={16}
                                            style={{ marginRight: '4px' }}
                                        />
                                        {processingId === user.id
                                            ? 'Processing...'
                                            : 'Reject'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

// Inline styles for simplicity
const styles = {
    container: {
        minHeight: '100vh',
        backgroundColor: '#f8fafc',
        padding: '20px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px',
        padding: '20px',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    },
    headerContent: {
        flex: 1,
    },
    title: {
        fontSize: '28px',
        fontWeight: '600',
        color: '#1a202c',
        margin: '0 0 4px 0',
    },
    subtitle: {
        fontSize: '16px',
        color: '#718096',
        margin: 0,
    },
    refreshButton: {
        display: 'flex',
        alignItems: 'center',
        padding: '10px 16px',
        backgroundColor: '#3182ce',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '500',
        transition: 'background-color 0.2s',
    },
    stats: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px',
        marginBottom: '30px',
    },
    statCard: {
        display: 'flex',
        alignItems: 'center',
        padding: '20px',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        gap: '16px',
    },
    statIcon: {
        color: '#3182ce',
    },
    statNumber: {
        fontSize: '24px',
        fontWeight: '600',
        color: '#1a202c',
        margin: '0 0 4px 0',
    },
    statLabel: {
        fontSize: '14px',
        color: '#718096',
        margin: 0,
    },
    content: {
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        overflow: 'hidden',
    },
    loadingState: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 20px',
        color: '#718096',
    },
    spinner: {
        animation: 'spin 1s linear infinite',
        marginBottom: '16px',
    },
    emptyState: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 20px',
        color: '#718096',
        textAlign: 'center',
    },
    emptyIcon: {
        marginBottom: '16px',
        opacity: 0.5,
    },
    requestsList: {
        padding: '20px',
    },
    sectionTitle: {
        fontSize: '20px',
        fontWeight: '600',
        color: '#1a202c',
        marginBottom: '20px',
    },
    requestCard: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '20px',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        marginBottom: '12px',
        transition: 'border-color 0.2s, box-shadow 0.2s',
    },
    userInfo: {
        display: 'flex',
        alignItems: 'center',
        flex: 1,
        gap: '16px',
    },
    userIcon: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '40px',
        height: '40px',
        backgroundColor: '#edf2f7',
        borderRadius: '50%',
        color: '#4a5568',
    },
    userDetails: {
        flex: 1,
    },
    userName: {
        fontSize: '16px',
        fontWeight: '600',
        color: '#1a202c',
        margin: '0 0 4px 0',
    },
    userEmail: {
        fontSize: '14px',
        color: '#718096',
        margin: '0 0 8px 0',
    },
    userMeta: {
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
    },
    metaItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        fontSize: '12px',
        color: '#a0aec0',
    },
    actions: {
        display: 'flex',
        gap: '12px',
    },
    actionButton: {
        display: 'flex',
        alignItems: 'center',
        padding: '8px 16px',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '500',
        transition: 'background-color 0.2s',
    },
    approveButton: {
        backgroundColor: '#48bb78',
        color: 'white',
    },
    rejectButton: {
        backgroundColor: '#e53e3e',
        color: 'white',
    },
};

// Add CSS animation for spinner
const styleSheet = document.createElement('style');
styleSheet.textContent = `
    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
`;
document.head.appendChild(styleSheet);

export default AdminDashboard;
