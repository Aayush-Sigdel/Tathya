import React, { useState } from 'react';
import { User, Mail, Lock, Eye, EyeOff, Calendar } from 'lucide-react';
import styles from './Auth.module.css';
import OTPModal from './otpModal';
import { useNavigate, useLocation } from 'react-router-dom';

const Auth = ({ setIsAuthenticated }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [showOTPModal, setShowOTPModal] = useState(false);
    const [isVerifyingOTP, setIsVerifyingOTP] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const [userEmail, setUserEmail] = useState('');
    const navigate = useNavigate();

    const [loginData, setLoginData] = useState({
        email: '',
        password: '',
        rememberMe: false,
    });

    const [signupData, setSignupData] = useState({
        fullName: '',
        email: '',
        dateOfBirth: '',
        password: '',
        confirmPassword: '',
        agreeToTerms: false,
    });

    const location = useLocation();
    const role = location.state?.role || 'user';

    // API Base URL - adjust this to match your backend URL
    const API_BASE_URL = 'http://localhost:8080';

    const handleLoginChange = (e) => {
        const { name, value, type, checked } = e.target;
        setLoginData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSignupChange = (e) => {
        const { name, value, type, checked } = e.target;
        setSignupData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        if (!loginData.email || !loginData.password) {
            alert('Please fill in all fields');
            return;
        }

        setIsLoading(true);

        try {
            console.log('=== LOGIN ATTEMPT ===');
            console.log('Email:', loginData.email);
            console.log('Password length:', loginData.password.length);
            console.log('API URL:', `${API_BASE_URL}/users/login`);

            const requestBody = {
                email: loginData.email,
                password: loginData.password,
            };

            console.log('Request payload:', requestBody);

            const response = await fetch(`${API_BASE_URL}/users/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(requestBody),
            });

            console.log('=== RESPONSE DETAILS ===');
            console.log('Status:', response.status);
            console.log('Status Text:', response.statusText);
            console.log(
                'Headers:',
                Object.fromEntries(response.headers.entries())
            );

            if (response.ok) {
                const token = await response.text();
                console.log('=== LOGIN SUCCESS ===');
                console.log('Token received:', token);
                console.log('Token length:', token.length);

                // Validate token format (basic check)
                if (!token || token.trim() === '') {
                    console.error('ERROR: Empty token received');
                    alert('Login failed: Invalid token received from server');
                    return;
                }

                // Store authentication data
                localStorage.setItem('accessToken', token);
                localStorage.setItem('userEmail', loginData.email);
                localStorage.setItem('userName', loginData.email.split('@')[0]);

                console.log('Authentication data stored successfully');

                // Update authentication state
                if (setIsAuthenticated) {
                    setIsAuthenticated(true);
                }

                // Navigate to home page
                navigate('/');
            } else {
                console.log('=== LOGIN FAILED ===');
                const errorText = await response.text();
                console.log('Error response body:', errorText);
                console.log('Response status:', response.status);

                // Show specific error messages
                let errorMessage = '';
                switch (response.status) {
                    case 401:
                        errorMessage =
                            'Invalid email or password. Please check your credentials.';
                        break;
                    case 403:
                        errorMessage =
                            'Account not verified or access forbidden.';
                        break;
                    case 404:
                        errorMessage = 'User not found. Please register first.';
                        break;
                    case 500:
                        errorMessage = 'Server error. Please try again later.';
                        break;
                    default:
                        errorMessage =
                            errorText ||
                            `Login failed with status ${response.status}`;
                }

                console.error('Login failed:', errorMessage);
                alert(`Login failed: ${errorMessage}`);
            }
        } catch (error) {
            console.log('=== NETWORK ERROR ===');
            console.error('Network error details:', error);
            console.error('Error name:', error.name);
            console.error('Error message:', error.message);

            alert(
                `Network error during login: ${error.message}. Please check if the backend is running on http://localhost:8080`
            );
        } finally {
            setIsLoading(false);
        }
    };

    const handleSignupSubmit = async (e) => {
        e.preventDefault();
        if (
            !signupData.fullName ||
            !signupData.email ||
            !signupData.dateOfBirth ||
            !signupData.password ||
            !signupData.confirmPassword
        ) {
            alert('Please fill in all fields');
            return;
        }
        if (signupData.password !== signupData.confirmPassword) {
            alert('Passwords do not match!');
            return;
        }
        if (!signupData.agreeToTerms) {
            alert('Please agree to the terms and conditions');
            return;
        }

        setIsLoading(true);

        try {
            console.log('=== REGISTRATION ATTEMPT ===');
            console.log('Registration data:', {
                name: signupData.fullName,
                email: signupData.email,
                dateOfBirth: signupData.dateOfBirth,
            });

            const response = await fetch(`${API_BASE_URL}/users/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    name: signupData.fullName,
                    email: signupData.email,
                    dateOfBirth: signupData.dateOfBirth,
                    password: signupData.password,
                    confirmPassword: signupData.confirmPassword,
                }),
            });

            console.log('Registration response status:', response.status);

            if (response.ok) {
                const message = await response.text();
                console.log('Registration successful:', message);

                // Show OTP modal for verification
                setUserEmail(signupData.email);
                setShowOTPModal(true);

                alert(
                    `Registration successful! ${message}. Please check your email for the OTP.`
                );
            } else {
                const errorText = await response.text();
                console.error(
                    'Registration failed with status:',
                    response.status,
                    'Error:',
                    errorText
                );
                alert(`Registration failed: ${errorText}`);
            }
        } catch (error) {
            console.error('Registration network error:', error);
            alert(
                'Network error during registration. Please check if the backend is running on http://localhost:8080'
            );
        } finally {
            setIsLoading(false);
        }
    };

    const handleOTPVerify = async (otpCode) => {
        setIsVerifyingOTP(true);

        try {
            console.log('=== OTP VERIFICATION ===');
            console.log('Email:', userEmail);
            console.log('OTP:', otpCode);

            const response = await fetch(
                `${API_BASE_URL}/users/register/verify-otp`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                    body: JSON.stringify({
                        email: userEmail,
                        otp: otpCode,
                    }),
                }
            );

            console.log('OTP verification response status:', response.status);

            if (response.ok) {
                const responseText = await response.text();
                console.log('OTP verification response text:', responseText);

                let result;
                try {
                    result = JSON.parse(responseText);
                    console.log('OTP verification successful (JSON):', result);
                } catch (jsonError) {
                    console.log(
                        'OTP verification successful (text):',
                        responseText
                    );
                    result = { message: responseText };
                }

                // Store authentication data
                if (result.token) {
                    localStorage.setItem('accessToken', result.token);
                    console.log('Token from OTP verification stored');
                } else {
                    const tempToken = 'verified-user-' + Date.now();
                    localStorage.setItem('accessToken', tempToken);
                    console.log('Temporary token created:', tempToken);
                }

                localStorage.setItem('userName', signupData.fullName);
                localStorage.setItem('userEmail', signupData.email);

                setShowOTPModal(false);

                if (setIsAuthenticated) {
                    setIsAuthenticated(true);
                }

                navigate('/');
                alert('Account verified successfully!');
            } else {
                const errorText = await response.text();
                console.error('OTP verification failed:', errorText);
                alert(`OTP verification failed: ${errorText}`);
            }
        } catch (error) {
            console.error('OTP verification network error:', error);
            alert('Network error during OTP verification. Please try again.');
        } finally {
            setIsVerifyingOTP(false);
        }
    };

    const handleResendOTP = async () => {
        try {
            console.log('Attempting to resend OTP for email:', userEmail);

            const response = await fetch(
                `${API_BASE_URL}/users/register/resend-otp?email=${encodeURIComponent(
                    userEmail
                )}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                }
            );

            console.log('Resend OTP response status:', response.status);

            if (response.ok) {
                const message = await response.text();
                console.log('OTP resent successfully:', message);
                alert(message || 'OTP sent successfully to your email');
            } else {
                const errorText = await response.text();
                console.error(
                    'Resend OTP failed with status:',
                    response.status,
                    'Error:',
                    errorText
                );
                alert(errorText || 'Failed to resend OTP. Please try again.');
            }
        } catch (error) {
            console.error('Resend OTP network error:', error);
            alert(
                'Network error while resending OTP. Please check your connection.'
            );
        }
    };

    const handleCloseOTPModal = () => {
        setShowOTPModal(false);
        setUserEmail('');
    };

    const toggleMode = () => {
        setIsLogin(!isLogin);
        setLoginData({
            email: '',
            password: '',
            rememberMe: false,
        });
        setSignupData({
            fullName: '',
            email: '',
            dateOfBirth: '',
            password: '',
            confirmPassword: '',
            agreeToTerms: false,
        });
    };

    return (
        <div className={styles['animated-auth-container']}>
            <div className={styles['auth-card']}>
                {/* Left Panel - Welcome Section */}
                <div
                    className={`${styles['welcome-panel']} ${
                        !isLogin ? styles['slide-right'] : ''
                    }`}>
                    {/* Login Welcome Content */}
                    <div
                        className={`${styles['welcome-content']} ${
                            !isLogin ? styles.hidden : styles.visible
                        }`}>
                        <div className={styles['welcome-icon']}>
                            <User size={30} />
                        </div>
                        <h2 className={styles['welcome-title']}>
                            Welcome Back!
                        </h2>
                        <p className={styles['welcome-subtitle']}>
                            To keep connected with us please login with your
                            personal info
                        </p>
                        <button
                            className={styles['welcome-button']}
                            onClick={toggleMode}>
                            Sign Up
                        </button>
                    </div>

                    {/* Signup Welcome Content */}
                    <div
                        className={`${styles['welcome-content']} ${
                            isLogin ? styles.hidden : styles.visible
                        }`}>
                        <div className={styles['welcome-icon']}>
                            <Mail size={30} />
                        </div>
                        <h2 className={styles['welcome-title']}>
                            Hello, Friend!
                        </h2>
                        <p className={styles['welcome-subtitle']}>
                            Enter your personal details and start journey with
                            us
                        </p>
                        <button
                            className={styles['welcome-button']}
                            onClick={toggleMode}>
                            Log In
                        </button>
                    </div>
                </div>

                {/* Right Panel - Forms Section */}
                <div
                    className={`${styles['forms-panel']} ${
                        !isLogin ? styles['slide-left'] : ''
                    }`}>
                    {/* Login Form */}
                    <div
                        className={`${styles['form-container']} ${
                            !isLogin ? styles.hidden : styles.visible
                        }`}>
                        <h1 className={styles['form-title']}>Log In</h1>
                        <p className={styles['form-subtitle']}>
                            Use your verified account credentials
                        </p>

                        <form onSubmit={handleLoginSubmit}>
                            <div className={styles['input-group']}>
                                <Mail className={styles['input-icon']} />
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="email"
                                    value={loginData.email}
                                    onChange={handleLoginChange}
                                    className={styles['auth-input']}
                                    required
                                    disabled={isLoading}
                                />
                            </div>

                            <div className={styles['input-group']}>
                                <Lock className={styles['input-icon']} />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    placeholder="Your account password"
                                    value={loginData.password}
                                    onChange={handleLoginChange}
                                    className={`${styles['auth-input']} ${styles['password-input']}`}
                                    required
                                    disabled={isLoading}
                                />
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPassword(!showPassword)
                                    }
                                    className={styles['password-toggle']}
                                    disabled={isLoading}>
                                    {showPassword ? (
                                        <EyeOff size={20} />
                                    ) : (
                                        <Eye size={20} />
                                    )}
                                </button>
                            </div>

                            <div className={styles['login-options']}>
                                <label className={styles['remember-me']}>
                                    <input
                                        type="checkbox"
                                        name="rememberMe"
                                        checked={loginData.rememberMe}
                                        onChange={handleLoginChange}
                                        disabled={isLoading}
                                    />
                                    Remember me
                                </label>
                                <button
                                    type="button"
                                    className={styles['forgot-link']}
                                    onClick={() =>
                                        navigate('/ForgotPassword', {
                                            state: { role: role },
                                        })
                                    }
                                    disabled={isLoading}>
                                    Forgot Password?
                                </button>
                            </div>

                            <button
                                type="submit"
                                className={styles['auth-submit-btn']}
                                disabled={isLoading}>
                                {isLoading ? 'Logging In...' : 'Log In'}
                            </button>
                        </form>
                    </div>

                    {/* Signup Form */}
                    <div
                        className={`${styles['form-container']} ${
                            styles['signup-form']
                        } ${isLogin ? styles.hidden : styles.visible}`}>
                        <h1 className={styles['form-title']}>Create Account</h1>
                        <p className={styles['form-subtitle']}>
                            Use your email for registration
                        </p>

                        <form onSubmit={handleSignupSubmit}>
                            <div className={styles['input-group']}>
                                <User className={styles['input-icon']} />
                                <input
                                    type="text"
                                    name="fullName"
                                    placeholder="Full Name"
                                    value={signupData.fullName}
                                    onChange={handleSignupChange}
                                    className={styles['auth-input']}
                                    required
                                    disabled={isLoading}
                                />
                            </div>

                            <div className={styles['input-group']}>
                                <Mail className={styles['input-icon']} />
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Email"
                                    value={signupData.email}
                                    onChange={handleSignupChange}
                                    className={styles['auth-input']}
                                    required
                                    disabled={isLoading}
                                />
                            </div>

                            <div className={styles['input-group']}>
                                <Calendar className={styles['input-icon']} />
                                <input
                                    type="date"
                                    name="dateOfBirth"
                                    placeholder="Date of Birth"
                                    value={signupData.dateOfBirth}
                                    onChange={handleSignupChange}
                                    className={styles['auth-input']}
                                    required
                                    disabled={isLoading}
                                />
                            </div>

                            <div className={styles['input-group']}>
                                <Lock className={styles['input-icon']} />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    placeholder="Password"
                                    value={signupData.password}
                                    onChange={handleSignupChange}
                                    className={`${styles['auth-input']} ${styles['password-input']}`}
                                    required
                                    disabled={isLoading}
                                />
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPassword(!showPassword)
                                    }
                                    className={styles['password-toggle']}
                                    disabled={isLoading}>
                                    {showPassword ? (
                                        <EyeOff size={20} />
                                    ) : (
                                        <Eye size={20} />
                                    )}
                                </button>
                            </div>

                            <div className={styles['input-group']}>
                                <Lock className={styles['input-icon']} />
                                <input
                                    type={
                                        showConfirmPassword
                                            ? 'text'
                                            : 'password'
                                    }
                                    name="confirmPassword"
                                    placeholder="Confirm Password"
                                    value={signupData.confirmPassword}
                                    onChange={handleSignupChange}
                                    className={`${styles['auth-input']} ${styles['password-input']}`}
                                    required
                                    disabled={isLoading}
                                />
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowConfirmPassword(
                                            !showConfirmPassword
                                        )
                                    }
                                    className={styles['password-toggle']}
                                    disabled={isLoading}>
                                    {showConfirmPassword ? (
                                        <EyeOff size={20} />
                                    ) : (
                                        <Eye size={20} />
                                    )}
                                </button>
                            </div>

                            <div className={styles['terms-checkbox']}>
                                <input
                                    type="checkbox"
                                    name="agreeToTerms"
                                    checked={signupData.agreeToTerms}
                                    onChange={handleSignupChange}
                                    required
                                    disabled={isLoading}
                                />
                                <label className={styles['terms-label']}>
                                    I agree to all Terms, Privacy Policy and
                                    Fees
                                </label>
                            </div>

                            <button
                                type="submit"
                                className={styles['auth-submit-btn']}
                                disabled={isLoading}>
                                {isLoading ? 'Creating Account...' : 'Sign Up'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
            {/* OTP Verification Modal */}
            <OTPModal
                isOpen={showOTPModal}
                onClose={handleCloseOTPModal}
                onVerify={handleOTPVerify}
                onResendOTP={handleResendOTP}
                email={userEmail}
                isLoading={isVerifyingOTP}
                resendCooldown={30}
            />
        </div>
    );
};

export default Auth;
