import React, { useState } from 'react';
import { CommentService, CommentUtils } from '../../services/commentService';

const AuthDebug = () => {
    const [debugInfo, setDebugInfo] = useState(null);
    const [testResults, setTestResults] = useState({});
    const [jwtInfo, setJwtInfo] = useState(null);

    const checkAuthState = () => {
        const token = localStorage.getItem('accessToken');
        let jwtPayload = null;

        if (token) {
            jwtPayload = CommentService.decodeJwtToken(token);
        }

        const authInfo = {
            localStorage: {
                accessToken: localStorage.getItem('accessToken')
                    ? 'Present'
                    : 'Missing',
                userEmail: localStorage.getItem('userEmail') || 'Missing',
                userId: localStorage.getItem('userId') || 'Missing',
                userName: localStorage.getItem('userName') || 'Missing',
                kycVerified: localStorage.getItem('kycVerified') || 'Missing',
            },
            isLoggedIn: CommentUtils.isLoggedIn(),
            headers: CommentService.getAuthHeaders(),
        };

        setDebugInfo(authInfo);
        setJwtInfo(jwtPayload);
        console.log('Auth Debug - Full state:', authInfo);
        console.log('JWT Payload:', jwtPayload);
    };

    const testUserIdLookup = async () => {
        try {
            setTestResults((prev) => ({ ...prev, userId: 'Testing...' }));
            const result = await CommentService.getUserIdForBackend();
            setTestResults((prev) => ({
                ...prev,
                userId: `Success: ${result} (type: ${typeof result})`,
            }));
        } catch (error) {
            setTestResults((prev) => ({
                ...prev,
                userId: `Error: ${error.message}`,
            }));
        }
    };

    const testKycEndpoint = async () => {
        try {
            setTestResults((prev) => ({ ...prev, kyc: 'Testing...' }));
            const result = await CommentService.checkKycVerification();
            setTestResults((prev) => ({ ...prev, kyc: `Success: ${result}` }));
        } catch (error) {
            setTestResults((prev) => ({
                ...prev,
                kyc: `Error: ${error.message}`,
            }));
        }
    };

    const testCommentPost = async () => {
        try {
            setTestResults((prev) => ({ ...prev, comment: 'Testing...' }));
            const result = await CommentService.postComment(
                CommentUtils.getUserId(),
                'test-news-id',
                'Test comment from debug panel'
            );
            setTestResults((prev) => ({
                ...prev,
                comment: `Success: ${JSON.stringify(result)}`,
            }));
        } catch (error) {
            setTestResults((prev) => ({
                ...prev,
                comment: `Error: ${error.message}`,
            }));
        }
    };

    const clearTokens = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userId');
        localStorage.removeItem('userName');
        localStorage.removeItem('kycVerified');
        alert('All auth tokens cleared');
        checkAuthState();
    };

    React.useEffect(() => {
        checkAuthState();
    }, []);

    return (
        <div
            style={{
                position: 'fixed',
                top: '10px',
                right: '10px',
                background: 'white',
                border: '2px solid #ff0000',
                padding: '15px',
                borderRadius: '8px',
                zIndex: 9999,
                maxWidth: '500px',
                maxHeight: '90vh',
                overflow: 'auto',
                fontSize: '11px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#ff0000' }}>
                🔧 Comment Auth Debug
            </h3>

            <div style={{ marginBottom: '10px' }}>
                <button
                    onClick={checkAuthState}
                    style={{
                        marginRight: '3px',
                        fontSize: '10px',
                        padding: '2px 6px',
                    }}>
                    Refresh
                </button>
                <button
                    onClick={testUserIdLookup}
                    style={{
                        marginRight: '3px',
                        fontSize: '10px',
                        padding: '2px 6px',
                    }}>
                    Test User ID
                </button>
                <button
                    onClick={testKycEndpoint}
                    style={{
                        marginRight: '3px',
                        fontSize: '10px',
                        padding: '2px 6px',
                    }}>
                    Test KYC
                </button>
                <button
                    onClick={testCommentPost}
                    style={{
                        marginRight: '3px',
                        fontSize: '10px',
                        padding: '2px 6px',
                    }}>
                    Test Comment
                </button>
                <button
                    onClick={clearTokens}
                    style={{
                        background: '#ff4444',
                        color: 'white',
                        fontSize: '10px',
                        padding: '2px 6px',
                    }}>
                    Clear All
                </button>
            </div>

            {debugInfo && (
                <div style={{ marginBottom: '10px' }}>
                    <strong style={{ color: '#0066cc' }}>Auth Status:</strong>
                    <div>Logged In: {debugInfo.isLoggedIn ? '✅' : '❌'}</div>
                    <div>
                        Access Token: {debugInfo.localStorage.accessToken}
                    </div>
                    <div>User Email: {debugInfo.localStorage.userEmail}</div>
                    <div>
                        KYC Verified: {debugInfo.localStorage.kycVerified}
                    </div>
                </div>
            )}

            {jwtInfo && (
                <div style={{ marginBottom: '10px' }}>
                    <strong style={{ color: '#cc6600' }}>JWT Contents:</strong>
                    <pre
                        style={{
                            background: '#f0f0f0',
                            padding: '5px',
                            fontSize: '9px',
                            maxHeight: '150px',
                            overflow: 'auto',
                            margin: '2px 0',
                        }}>
                        {JSON.stringify(jwtInfo, null, 2)}
                    </pre>
                </div>
            )}

            {Object.keys(testResults).length > 0 && (
                <div>
                    <strong style={{ color: '#009900' }}>Test Results:</strong>
                    {Object.entries(testResults).map(([key, value]) => (
                        <div
                            key={key}
                            style={{ marginBottom: '3px', fontSize: '10px' }}>
                            <strong>{key}:</strong>{' '}
                            <span style={{ wordBreak: 'break-all' }}>
                                {value}
                            </span>
                        </div>
                    ))}
                </div>
            )}

            <div
                style={{
                    marginTop: '10px',
                    fontSize: '9px',
                    color: '#666',
                }}>
                <strong>Expected:</strong> Backend needs userId as{' '}
                <code>long</code> (number)
                <br />
                <strong>Current:</strong> We're sending email string
                <br />
                <strong>Solution:</strong> Extract numeric ID from JWT or create
                lookup
            </div>
        </div>
    );
};

export default AuthDebug;
