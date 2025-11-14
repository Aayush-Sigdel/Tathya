import React, { useState, useRef, useEffect } from 'react';
import { X, Mail, RefreshCw } from 'lucide-react';
import styles from './otpModal.module.css';

const OTPModal = ({
                                  isOpen,
                                  onClose,
                                  onVerify,
                                  onResendOTP,
                                  email,
                                  isLoading = false,
                                  resendCooldown = 30
                              }) => {
    const [otp, setOTP] = useState(['', '', '', '', '', '']);
    const [resendTimer, setResendTimer] = useState(0);
    const [error, setError] = useState('');
    const [verifying, setVerifying] = useState(false);
    const inputRefs = useRef([]);

    // Timer for resend cooldown
    useEffect(() => {
        let interval;
        if (resendTimer > 0) {
            interval = setInterval(() => {
                setResendTimer(timer => timer - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [resendTimer]);

    // Focus first input when modal opens
    useEffect(() => {
        if (isOpen && inputRefs.current[0]) {
            inputRefs.current[0].focus();
        }
    }, [isOpen]);

    const handleInputChange = (index, value) => {
        // Only allow numeric input
        if (!/^\d*$/.test(value)) return;

        const newOTP = [...otp];
        newOTP[index] = value;
        setOTP(newOTP);
        setError('');

        // Auto-focus next input
        if (value && index < 5) {
            inputRefs.current[index + 1].focus();
        }
    };

    const handleKeyDown = (index, e) => {
        // Handle backspace
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1].focus();
        }

        // Handle paste
        if (e.key === 'v' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            navigator.clipboard.readText().then(text => {
                const pastedOTP = text.replace(/\D/g, '').slice(0, 6).split('');
                const newOTP = [...otp];
                pastedOTP.forEach((digit, idx) => {
                    if (idx < 6) newOTP[idx] = digit;
                });
                setOTP(newOTP);
                // Focus the next empty input or last input
                const nextEmptyIndex = newOTP.findIndex(digit => !digit);
                const focusIndex = nextEmptyIndex === -1 ? 5 : nextEmptyIndex;
                inputRefs.current[focusIndex].focus();
            });
        }
    };

    const handleSubmit = async () => {
        const otpString = otp.join('');

        if (otpString.length !== 6) {
            setError('Please enter the complete 6-digit code');
            return;
        }

        setVerifying(true);
        setError('');

        try {
            await onVerify(otpString);
            // Success - the parent component will handle closing modal and navigation
        } catch (error) {
            console.error('OTP Verification failed:', error);
            setError(error.message || 'Verification failed. Please try again.');
            // Clear OTP inputs on error
            setOTP(['', '', '', '', '', '']);
            // Focus first input
            if (inputRefs.current[0]) {
                inputRefs.current[0].focus();
            }
        } finally {
            setVerifying(false);
        }
    };

    const handleResendOTP = async () => {
        if (resendTimer > 0) return;

        setResendTimer(resendCooldown);
        setOTP(['', '', '', '', '', '']);
        setError('');

        try {
            await onResendOTP();
        } catch (error) {
            console.error('Resend OTP failed:', error);
            setError('Failed to resend code. Please try again.');
        }

        inputRefs.current[0].focus();
    };

    const handleClose = () => {
        setOTP(['', '', '', '', '', '']);
        setError('');
        setResendTimer(0);
        setVerifying(false);
        onClose();
    };

    if (!isOpen) return null;

    const isCurrentlyLoading = isLoading || verifying;

    return (
        <div className={styles["modal-overlay"]}>
            <div className={styles["modal-container"]}>
                <button
                    className={styles["close-button"]}
                    onClick={handleClose}
                    disabled={isCurrentlyLoading}
                >
                    <X size={24} />
                </button>

                <div className={styles["modal-content"]}>
                    <div className={styles["icon-container"]}>
                        <Mail size={32} />
                    </div>

                    <h2 className={styles["modal-title"]}>Verify Your Email</h2>
                    <p className={styles["modal-subtitle"]}>
                        We've sent a 6-digit verification code to
                    </p>
                    <p className={styles["email-display"]}>{email}</p>

                    <div className={styles["otp-form"]}>
                        <div className={styles["otp-inputs"]}>
                            {otp.map((digit, index) => (
                                <input
                                    key={index}
                                    ref={el => inputRefs.current[index] = el}
                                    type="text"
                                    value={digit}
                                    onChange={(e) => handleInputChange(index, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(index, e)}
                                    className={`${styles["otp-input"]} ${error ? styles["error"] : ''}`}
                                    maxLength="1"
                                    disabled={isCurrentlyLoading}
                                />
                            ))}
                        </div>

                        {error && <div className={styles["error-message"]}>{error}</div>}

                        <button
                            onClick={handleSubmit}
                            className={`${styles["verify-button"]} ${isCurrentlyLoading ? styles["loading"] : ''}`}
                            disabled={isCurrentlyLoading}
                        >
                            {isCurrentlyLoading ? (
                                <>
                                    <RefreshCw size={20} className={styles["spin"]} />
                                    Verifying...
                                </>
                            ) : (
                                'Verify Code'
                            )}
                        </button>
                    </div>

                    <div className={styles["resend-section"]}>
                        <p className={styles["resend-text"]}>Didn't receive the code?</p>
                        <button
                            onClick={handleResendOTP}
                            disabled={resendTimer > 0 || isCurrentlyLoading}
                            className={styles["resend-button"]}
                        >
                            {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend Code'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OTPModal;