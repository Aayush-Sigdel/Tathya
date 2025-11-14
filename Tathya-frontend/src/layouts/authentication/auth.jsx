import React, { useState } from 'react';
import { User, Mail, Lock, Eye, EyeOff, Calendar } from 'lucide-react';
import styles from './Auth.module.css';
import OTPModal from './otpModal';
import { useNavigate, useLocation } from "react-router-dom";


const Auth = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [showOTPModal, setShowOTPModal] = useState(false);
    const [isVerifyingOTP, setIsVerifyingOTP] = useState(false);
  
    const [userEmail, setUserEmail] = useState('');
    const navigate = useNavigate();

    const [loginData, setLoginData] = useState({
        email: '',
        password: '',
        rememberMe: false
    });

    const [signupData, setSignupData] = useState({
        fullName: '',
        email: '',
        dateOfBirth: '',
        password: '',
        confirmPassword: '',
        agreeToTerms: false
    });

    const location = useLocation();
    const role = location.state?.role || "user";

    const handleLoginChange = (e) => {
        const { name, value, type, checked } = e.target;
        setLoginData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSignupChange = (e) => {
        const { name, value, type, checked } = e.target;
        setSignupData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        if (!loginData.email || !loginData.password) {
            alert('Please fill in all fields');
            return;
        }

        try {
            const response = await fetch(`api/auth/login/${role}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    email: loginData.email,
                    password: loginData.password
                })
            });

            if (response.ok) {
                const data = await response.json();
                localStorage.setItem('accessToken', data.token);
                localStorage.setItem('userEmail', loginData.email);

                try {
                    const payload = JSON.parse(atob(data.token.split('.')[1]));
                    localStorage.setItem('userName', payload.name);
                    localStorage.setItem('userEmail', payload.email);
                } catch (decodeError) {
                    console.error('Error decoding token:', decodeError);
                }
                console.log('Login success:', data);

                const userRole = role || signupData.role;

                if (userRole === 'user') {
                    navigate("/UserLayout");
                } else if (userRole === 'technician') {
                    navigate("/TechnicianLayout");
                } else {
                    console.error('Unknown role:', userRole);
                }
            } else {
                const errorData = await response.json();
                alert(errorData.message || 'Login failed');
            }
        } catch (error) {
            console.error('Login error:', error);
            alert('An error occurred during login');
        }
    };

    const handleSignupSubmit = async (e) => {
        e.preventDefault();
        if (!signupData.fullName || !signupData.email || !signupData.dateOfBirth || !signupData.password || !signupData.confirmPassword) {
            alert('Please fill in all fields');
            return;
        }
        if (signupData.password !== signupData.confirmPassword) {
            alert("Passwords do not match!");
            return;
        }

        try {
            const response = await fetch(`api/auth/signup/${role}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    name: signupData.fullName,
                    email: signupData.email,
                    dateOfBirth: signupData.dateOfBirth,
                    password: signupData.password,
                    confirmPassword: signupData.confirmPassword
                })
            });

            if (response.ok) {
                setUserEmail(signupData.email);
                setShowOTPModal(true);
            } else {
                const errorData = await response.json();
                alert(errorData.message || 'Signup failed');
            }
        } catch (error) {
            console.error('Signup error:', error);
            alert('An error occurred during signup');
        }
    };

    const handleOTPVerify = async (otpCode) => {
        setIsVerifyingOTP(true);
        try {
            const response = await fetch(`api/auth/signup/${role}/verify-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    email: userEmail,
                    otp: otpCode
                })
            });

            if (response.ok) {
                const data = await response.json();
                localStorage.setItem('userName', signupData.fullName);
                localStorage.setItem('userEmail', signupData.email);
                localStorage.setItem('accessToken', data.token);

                console.log('OTP verification successful, user data and token stored');

                setShowOTPModal(false);

                const userRole = role || signupData.role;

                if (userRole === 'user') {
                    navigate("/UserLayout");
                } else if (userRole === 'technician') {
                    navigate("/TechnicianLayout");
                } else {
                    console.error('Unknown role:', userRole);
                }
            } else {
                const errorData = await response.json();
                alert(errorData.message || 'Invalid OTP');
            }
        } catch (error) {
            console.error('OTP verification error:', error);
            alert('An error occurred during verification');
        } finally {
            setIsVerifyingOTP(false);
        }
    };

    const handleResendOTP = async () => {
        try {
            const response = await fetch(`api/auth/signup/${role}/resend-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ email: userEmail })
            });

            if (response.ok) {
                alert('OTP successfully sent');
            } else {
                const errorData = await response.json();
                alert(errorData.message || 'Failed to resend OTP');
            }
        } catch (error) {
            console.error('Resend OTP error:', error);
            alert('An error occurred while resending OTP');
        }
    };

    const handleCloseOTPModal = () => {
        setShowOTPModal(false);
        setUserEmail('');
    };

    const toggleMode = () => {
        setIsLogin(!isLogin);
    };

    return (
        <div className={styles['animated-auth-container']}>
            <div className={styles['auth-card']}>

                {/* Left Panel - Welcome Section */}
                <div className={`${styles['welcome-panel']} ${!isLogin ? styles['slide-right'] : ''}`}>

                    {/* Login Welcome Content */}
                    <div className={`${styles['welcome-content']} ${!isLogin ? styles.hidden : styles.visible}`}>
                        <div className={styles['welcome-icon']}>
                            <User size={30} />
                        </div>
                        <h2 className={styles['welcome-title']}>Welcome Back!</h2>
                        <p className={styles['welcome-subtitle']}>
                            To keep connected with us please login with your personal info
                        </p>
                        <button className={styles['welcome-button']} onClick={toggleMode}>
                            Sign Up
                        </button>
                    </div>

                    {/* Signup Welcome Content */}
                    <div className={`${styles['welcome-content']} ${isLogin ? styles.hidden : styles.visible}`}>
                        <div className={styles['welcome-icon']}>
                            <Mail size={30} />
                        </div>
                        <h2 className={styles['welcome-title']}>Hello, Friend!</h2>
                        <p className={styles['welcome-subtitle']}>
                            Enter your personal details and start journey with us
                        </p>
                        <button className={styles['welcome-button']} onClick={toggleMode}>
                            Log In
                        </button>
                    </div>

                </div>

                {/* Right Panel - Forms Section */}
                <div className={`${styles['forms-panel']} ${!isLogin ? styles['slide-left'] : ''}`}>

                    {/* Login Form */}
                    <div className={`${styles['form-container']} ${!isLogin ? styles.hidden : styles.visible}`}>
                        <h1 className={styles['form-title']}>Log In</h1>
                        <p className={styles['form-subtitle']}>Use your account</p>

                        <form onSubmit={handleLoginSubmit}>
                            <div className={styles['input-group']}>
                                <Mail className={styles['input-icon']} />
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Email"
                                    value={loginData.email}
                                    onChange={handleLoginChange}
                                    className={styles['auth-input']}
                                    required
                                />
                            </div>

                            <div className={styles['input-group']}>
                                <Lock className={styles['input-icon']} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    placeholder="Password"
                                    value={loginData.password}
                                    onChange={handleLoginChange}
                                    className={`${styles['auth-input']} ${styles['password-input']}`}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className={styles['password-toggle']}
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>

                            <div className={styles['login-options']}>
                                <label className={styles['remember-me']}>
                                    <input
                                        type="checkbox"
                                        name="rememberMe"
                                        checked={loginData.rememberMe}
                                        onChange={handleLoginChange}
                                    />
                                    Remember me
                                </label>
                                <button 
                                    type="button" 
                                    className={styles['forgot-link']} 
                                    onClick={() => navigate("/ForgotPassword", { state: { role: role } })}
                                >
                                    Forgot Password?
                                </button>
                            </div>

                            <button type="submit" className={styles['auth-submit-btn']}>Log In</button>
                        </form>
                    </div>

                    {/* Signup Form */}
                    <div className={`${styles['form-container']} ${styles['signup-form']} ${isLogin ? styles.hidden : styles.visible}`}>
                        <h1 className={styles['form-title']}>Create Account</h1>
                        <p className={styles['form-subtitle']}>Use your email for registration</p>

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
                                />
                            </div>

                            <div className={styles['input-group']}>
                                <Lock className={styles['input-icon']} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    placeholder="Password"
                                    value={signupData.password}
                                    onChange={handleSignupChange}
                                    className={`${styles['auth-input']} ${styles['password-input']}`}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className={styles['password-toggle']}
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>

                            <div className={styles['input-group']}>
                                <Lock className={styles['input-icon']} />
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    name="confirmPassword"
                                    placeholder="Confirm Password"
                                    value={signupData.confirmPassword}
                                    onChange={handleSignupChange}
                                    className={`${styles['auth-input']} ${styles['password-input']}`}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className={styles['password-toggle']}
                                >
                                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>

                            <div className={styles['terms-checkbox']}>
                                <input
                                    type="checkbox"
                                    name="agreeToTerms"
                                    checked={signupData.agreeToTerms}
                                    onChange={handleSignupChange}
                                    required
                                />
                                <label className={styles['terms-label']}>
                                    I agree to all Terms, Privacy Policy and Fees
                                </label>
                            </div>

                            <button type="submit" className={styles['auth-submit-btn']}>Sign Up</button>
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