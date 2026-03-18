import React, { useState, useRef, useEffect } from 'react';
import {
    User,
    Mail,
    Phone,
    MapPin,
    Edit2,
    Check,
    X,
    Camera,
    Upload,
    Send,
    Loader2,
    AlertTriangle,
    Shield,
    Clock,
} from 'lucide-react';
import styles from './profile.module.css';
import ProfileMetrics from './profileMetrics';
import VerificationStatus from './verificationStatus';

const Profile = ({ userInfo, onUpdateProfile, sidebarCollapsed = false }) => {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phoneNumber: '',
        address: '',
        bio: '',
        coordinates: null,
        avatar: null,
        profileImageFile: null,
        citizenshipPhoto: null,
        citizenshipPhotoFile: null,
        kycVerified: false,
        kycDocumentPath: null,
        verificationStatus: 'not_applied', // 'not_applied', 'pending', 'verified', 'rejected'
        verificationDate: null,
    });

    const [isEditing, setIsEditing] = useState({
        fullName: false,
        email: false,
        phoneNumber: false,
        address: false,
        bio: false,
    });

    const [tempValues, setTempValues] = useState({
        fullName: '',
        email: '',
        phoneNumber: '',
        address: '',
        bio: '',
    });

    const inputRefs = {
        fullName: useRef(null),
        email: useRef(null),
        phoneNumber: useRef(null),
        address: useRef(null),
        bio: useRef(null),
    };

    const [locationSearch, setLocationSearch] = useState('');
    const [isGettingCurrentLocation, setIsGettingCurrentLocation] =
        useState(false);
    const [error, setError] = useState(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [isSubmittingKyc, setIsSubmittingKyc] = useState(false);
    const [isCheckingKyc, setIsCheckingKyc] = useState(false);

    // Calculate profile completion with KYC verification included
    const calculateProfileCompletion = () => {
        const fields = [
            { field: 'fullName', label: 'Full Name', weight: 20 },
            { field: 'email', label: 'Email', weight: 15 },
            { field: 'phoneNumber', label: 'Phone', weight: 15 },
            { field: 'address', label: 'Address', weight: 15 },
            { field: 'bio', label: 'Bio', weight: 10 },
            { field: 'avatar', label: 'Profile Photo', weight: 10 },
            { field: 'kycVerified', label: 'KYC Verified', weight: 15 },
        ];

        let totalScore = 0;
        const metrics = fields.map(({ field, label, weight }) => {
            let completed = false;
            let value = '';

            if (field === 'avatar') {
                completed = !!formData.avatar;
                value = completed ? '✓' : '✗';
            } else if (field === 'kycVerified') {
                completed = formData.kycVerified;
                value = completed
                    ? '✓ Verified'
                    : formData.verificationStatus === 'pending'
                    ? '⏳ Pending'
                    : '✗ Not Verified';
            } else {
                completed = !!formData[field];
                value = completed ? '✓' : '✗';
            }

            if (completed) {
                totalScore += weight;
            }

            return {
                label,
                completed,
                value,
                weight,
            };
        });

        return {
            percentage: Math.round(totalScore),
            metrics,
        };
    };

    // Check KYC verification status using the backend endpoint
    const checkKycStatus = async (showMessages = false) => {
        const email = localStorage.getItem('userEmail');
        if (!email) return;

        try {
            setIsCheckingKyc(true);
            console.log('Checking KYC status for:', email);

            const response = await fetch(
                `http://localhost:8080/users/is-kyc-verified?email=${encodeURIComponent(
                    email
                )}`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${
                            localStorage.getItem('accessToken') || ''
                        }`,
                    },
                }
            );

            if (response.ok) {
                const isVerified = await response.json();
                console.log('KYC verification status:', isVerified);

                const wasVerified = formData.kycVerified;
                const hadPendingStatus =
                    formData.verificationStatus === 'pending';

                // Update the KYC status
                setFormData((prev) => ({
                    ...prev,
                    kycVerified: isVerified,
                    verificationStatus: isVerified
                        ? 'verified'
                        : prev.kycDocumentPath
                        ? 'pending'
                        : 'not_applied',
                    verificationDate:
                        isVerified && !wasVerified
                            ? new Date().toISOString()
                            : prev.verificationDate,
                }));

                // Show success message if status changed from pending to verified
                if (
                    isVerified &&
                    !wasVerified &&
                    hadPendingStatus &&
                    showMessages
                ) {
                    setSuccessMessage(
                        '🎉 Congratulations! Your KYC verification has been approved!'
                    );

                    // Store verification status in localStorage for other components
                    localStorage.setItem('kycVerified', 'true');
                    localStorage.setItem(
                        'kycVerificationDate',
                        new Date().toISOString()
                    );
                }

                // Store current KYC status in localStorage
                localStorage.setItem('kycVerified', isVerified.toString());
            } else {
                console.error('Failed to check KYC status:', response.status);
            }
        } catch (error) {
            console.error('Error checking KYC status:', error);
        } finally {
            setIsCheckingKyc(false);
        }
    };

    // Fetch user profile data
    const fetchProfile = async () => {
        try {
            const email = localStorage.getItem('userEmail');
            if (!email) {
                console.error('No email found in localStorage');
                return;
            }

            const response = await fetch(
                `http://localhost:8080/api/users/profile?email=${email}`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${
                            localStorage.getItem('accessToken') || ''
                        }`,
                    },
                }
            );

            if (response.ok) {
                const data = await response.json();

                const avatarUrl = getProfileImageUrl(data.profileImagePath);
                const docUrl = getFileUrl(data.kycDocumentPath);

                setFormData((prev) => ({
                    ...prev,
                    fullName: data.username || '',
                    email: data.email || '',
                    phoneNumber: data.phone || '',
                    address: data.address || '',
                    avatar: avatarUrl || null,
                    citizenshipPhoto: docUrl || null,
                    bio: data.bio || '',
                    kycVerified: data.kycVerified || false,
                    kycDocumentPath: data.kycDocumentPath || null,
                    verificationStatus: data.kycVerified
                        ? 'verified'
                        : data.kycDocumentPath
                        ? 'pending'
                        : 'not_applied',
                    verificationDate: data.kycVerificationDate || null,
                }));

                setLocationSearch(data.address || '');

                if (data.username)
                    localStorage.setItem('userName', data.username);
                if (data.email) localStorage.setItem('userEmail', data.email);

                // Store KYC status in localStorage
                localStorage.setItem(
                    'kycVerified',
                    (data.kycVerified || false).toString()
                );
            } else {
                console.error('Failed to fetch profile:', response.status);
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
            setError('Failed to load profile data');
        }
    };

    // Submit KYC verification document
    const handleKycVerification = async () => {
        if (!formData.citizenshipPhotoFile) {
            setError('Please select a citizenship document first');
            return;
        }

        try {
            setIsSubmittingKyc(true);
            setError(null);

            const email = localStorage.getItem('userEmail');
            if (!email) {
                throw new Error('No email found. Please login again.');
            }

            const kycFormData = new FormData();
            kycFormData.append('email', email);
            kycFormData.append('valid_doc', formData.citizenshipPhotoFile);

            const response = await fetch(
                'http://localhost:8080/users/verify-kyc',
                {
                    method: 'POST',
                    body: kycFormData,
                    headers: {
                        Authorization: `Bearer ${
                            localStorage.getItem('accessToken') || ''
                        }`,
                    },
                }
            );

            if (response.ok) {
                const result = await response.text(); // Since your endpoint returns a string message
                console.log('KYC submitted successfully:', result);

                // Update the form data to reflect pending status
                setFormData((prev) => ({
                    ...prev,
                    kycDocumentPath: 'submitted', // Mark as submitted
                    verificationStatus: 'pending',
                }));

                setSuccessMessage(
                    'KYC verification document submitted successfully! Your document is now under review by our admin team.'
                );

                // Store pending status in localStorage
                localStorage.setItem('kycVerified', 'false');
                localStorage.setItem('kycStatus', 'pending');

                // Start periodic checking for verification status
                setTimeout(() => {
                    checkKycStatus(true);
                }, 3000);
            } else {
                const errorText = await response.text();
                throw new Error(errorText || 'Failed to submit KYC document');
            }
        } catch (error) {
            console.error('KYC submission error:', error);
            setError(`Failed to submit KYC: ${error.message}`);
        } finally {
            setIsSubmittingKyc(false);
        }
    };

    // Periodic KYC status checking
    useEffect(() => {
        const checkKycPeriodically = () => {
            const kycStatus = localStorage.getItem('kycVerified');
            const hasEmail = localStorage.getItem('userEmail');

            if (hasEmail && kycStatus !== 'true') {
                checkKycStatus(true);
            }
        };

        // Check on component mount
        fetchProfile().then(() => {
            checkKycStatus(false);
        });

        // Set up periodic checking every 30 seconds if KYC is not verified
        const interval = setInterval(() => {
            const kycVerified = localStorage.getItem('kycVerified') === 'true';
            if (!kycVerified && formData.email) {
                checkKycPeriodically();
            }
        }, 30000); // Check every 30 seconds

        // Also check when the page becomes visible (user returns to tab)
        const handleVisibilityChange = () => {
            if (!document.hidden) {
                checkKycPeriodically();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            clearInterval(interval);
            document.removeEventListener(
                'visibilitychange',
                handleVisibilityChange
            );
        };
    }, []);

    // Auto-check KYC status when form data changes
    useEffect(() => {
        if (formData.email && formData.verificationStatus === 'pending') {
            const intervalId = setInterval(() => {
                checkKycStatus(true);
            }, 15000); // Check every 15 seconds when pending

            return () => clearInterval(intervalId);
        }
    }, [formData.verificationStatus, formData.email]);

    // Click outside handler
    useEffect(() => {
        const handleClickOutside = (event) => {
            Object.entries(inputRefs).forEach(([field, ref]) => {
                if (ref.current && !ref.current.contains(event.target)) {
                    if (isEditing[field]) {
                        setIsEditing((prev) => ({
                            ...prev,
                            [field]: false,
                        }));
                    }
                }
            });
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isEditing]);

    const handleInputChange = (field, value) => {
        setTempValues((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const startEdit = (field) => {
        setTempValues((prev) => ({
            ...prev,
            [field]: formData[field],
        }));
        setIsEditing((prev) => ({
            ...prev,
            [field]: true,
        }));
        setTimeout(() => {
            if (inputRefs[field].current) {
                inputRefs[field].current.focus();
            }
        }, 100);
    };

    const cancelEdit = (field) => {
        setIsEditing((prev) => ({
            ...prev,
            [field]: false,
        }));
    };

    const saveEdit = (field) => {
        setFormData((prev) => ({
            ...prev,
            [field]: tempValues[field],
        }));
        setIsEditing((prev) => ({
            ...prev,
            [field]: false,
        }));
    };

    const getJWTFromCookie = () => {
        const cookies = document.cookie.split(';');
        for (let cookie of cookies) {
            const [name, value] = cookie.trim().split('=');
            if (name === 'jwt') {
                return value;
            }
        }
        return null;
    };

    const getProfileImageUrl = (dbPath) => {
        if (!dbPath) return null;
        return `http://localhost:8080/uploads/users/${dbPath}`;
    };

    const getFileUrl = (filename) => {
        if (!filename) return null;
        if (filename.startsWith('http')) return filename;
        return `http://localhost:8080/uploads/users/${filename}`;
    };

    const updateProfileOnBackend = async () => {
        try {
            const email = localStorage.getItem('userEmail');
            if (!email) {
                throw new Error('No email found in localStorage');
            }

            const updateData = new FormData();
            updateData.append('email', email);
            updateData.append('username', formData.fullName);
            updateData.append('phone', formData.phoneNumber);
            updateData.append('address', formData.address);
            updateData.append('bio', formData.bio);

            if (formData.profileImageFile) {
                updateData.append('profileImage', formData.profileImageFile);
            }

            const response = await fetch(
                'http://localhost:8080/api/users/profile',
                {
                    method: 'PUT',
                    body: updateData,
                    headers: {
                        Authorization: `Bearer ${
                            localStorage.getItem('accessToken') || ''
                        }`,
                    },
                }
            );

            if (response.ok) {
                const result = await response.json();
                console.log('Profile updated successfully:', result);

                // Update localStorage with new values
                localStorage.setItem('userName', formData.fullName);
                if (formData.email) {
                    localStorage.setItem('userEmail', formData.email);
                }

                setSuccessMessage('Profile updated successfully!');
                return true;
            } else {
                const errorData = await response.json();
                console.error('Profile update failed:', errorData);
                throw new Error(
                    errorData.message || 'Failed to update profile'
                );
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            throw error;
        }
    };

    const handleSave = async () => {
        try {
            setIsUpdating(true);
            setError(null);
            await updateProfileOnBackend();
        } catch (error) {
            setError(`Failed to update profile: ${error.message}`);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleAvatarChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setFormData((prev) => ({
                    ...prev,
                    avatar: e.target.result,
                    profileImageFile: file,
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleVerificationFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setFormData((prev) => ({
                    ...prev,
                    citizenshipPhoto: e.target.result,
                    citizenshipPhotoFile: file,
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleGetCurrentLocation = async () => {
        if (!navigator.geolocation) {
            setError('Geolocation is not supported by this browser');
            return;
        }

        setIsGettingCurrentLocation(true);

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    const { latitude, longitude } = position.coords;
                    setFormData((prev) => ({
                        ...prev,
                        coordinates: { lat: latitude, lng: longitude },
                    }));

                    // You can implement reverse geocoding here if needed
                    // For now, just use coordinates
                    const locationString = `${latitude.toFixed(
                        6
                    )}, ${longitude.toFixed(6)}`;
                    setFormData((prev) => ({
                        ...prev,
                        address: locationString,
                    }));
                    setLocationSearch(locationString);
                } catch (error) {
                    console.error('Error getting address:', error);
                } finally {
                    setIsGettingCurrentLocation(false);
                }
            },
            (error) => {
                console.error('Geolocation error:', error);
                setError('Unable to get your current location');
                setIsGettingCurrentLocation(false);
            }
        );
    };

    const { percentage, metrics } = calculateProfileCompletion();

    // If KYC is verified, show only the verification completion box
    if (formData.verificationStatus === 'verified') {
        return (
            <div
                className={`${styles['profile-wrapper']} ${
                    sidebarCollapsed ? styles['sidebar-collapsed'] : ''
                }`}>
                <div className={styles['profile-layout']}>
                    {/* Single Column Layout for Verified Users */}
                    <div
                        style={{
                            gridColumn: '1 / -1',
                            display: 'flex',
                            justifyContent: 'center',
                            padding: '4rem 2rem',
                        }}>
                        <div style={{ maxWidth: '600px', width: '100%' }}>
                            {/* Success/Error Messages */}
                            {successMessage && (
                                <div className={styles['success-message']}>
                                    <Check size={16} />
                                    <span>{successMessage}</span>
                                    <button
                                        onClick={() => setSuccessMessage('')}
                                        className={styles['close-btn']}>
                                        <X size={14} />
                                    </button>
                                </div>
                            )}

                            {error && (
                                <div className={styles['error-message']}>
                                    <AlertTriangle size={16} />
                                    <span>{error}</span>
                                    <button
                                        onClick={() => setError(null)}
                                        className={styles['close-btn']}>
                                        <X size={14} />
                                    </button>
                                </div>
                            )}

                            {/* KYC Verification Completion Box */}
                            <section className={styles['form-section']}>
                                <div className={styles['kyc-header']}>
                                    <h2 className={styles['section-title']}>
                                        <Shield size={24} />
                                        KYC Verification Status
                                    </h2>

                                    <div
                                        className={`${styles['kyc-status-badge']} ${styles['kyc-verified']}`}>
                                        <Check size={16} />
                                        <span>Verified</span>
                                    </div>
                                </div>

                                <div className={styles['kyc-verified-section']}>
                                    <div
                                        className={
                                            styles['kyc-success-message']
                                        }>
                                        <Check size={28} />
                                        <div>
                                            <h3
                                                style={{
                                                    fontSize: '1.5rem',
                                                    marginBottom: '1rem',
                                                }}>
                                                Verification Complete!
                                            </h3>
                                            <p
                                                style={{
                                                    fontSize: '1.1rem',
                                                    marginBottom: '0.5rem',
                                                }}>
                                                Congratulations! Your identity
                                                has been successfully verified.
                                                You now have access to all
                                                premium features of our platform
                                                including:
                                            </p>
                                            <ul
                                                style={{
                                                    margin: '1rem 0',
                                                    paddingLeft: '1.5rem',
                                                    lineHeight: '1.8',
                                                }}></ul>
                                            {formData.verificationDate && (
                                                <p
                                                    className={
                                                        styles[
                                                            'verification-date'
                                                        ]
                                                    }>
                                                    Verified on{' '}
                                                    {new Date(
                                                        formData.verificationDate
                                                    ).toLocaleDateString(
                                                        'en-US',
                                                        {
                                                            year: 'numeric',
                                                            month: 'long',
                                                            day: 'numeric',
                                                        }
                                                    )}
                                                </p>
                                            )}
                                            <div
                                                style={{
                                                    marginTop: '2rem',
                                                    textAlign: 'center',
                                                }}>
                                                <button
                                                    onClick={() =>
                                                        (window.location.href =
                                                            '/')
                                                    }
                                                    className={
                                                        styles['kyc-submit-btn']
                                                    }
                                                    style={{
                                                        background:
                                                            'linear-gradient(135deg, #10b981, #059669)',
                                                        fontSize: '1rem',
                                                        padding: '1rem 2rem',
                                                    }}>
                                                    Start Exploring News
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div
            className={`${styles['profile-wrapper']} ${
                sidebarCollapsed ? styles['sidebar-collapsed'] : ''
            }`}>
            <div className={styles['profile-layout']}>
                {/* Left Column - Profile Form */}
                <div className={styles['profile-main']}>
                    <div className={styles['profile-form']}>
                        <div className={styles['profile-header']}>
                            <h1 className={styles['profile-title']}>
                                Complete Your Profile
                            </h1>
                            <p className={styles['profile-subtitle']}>
                                Update your personal information and complete
                                KYC verification to unlock all features
                            </p>
                        </div>

                        {/* Success/Error Messages */}
                        {successMessage && (
                            <div className={styles['success-message']}>
                                <Check size={16} />
                                <span>{successMessage}</span>
                                <button
                                    onClick={() => setSuccessMessage('')}
                                    className={styles['close-btn']}>
                                    <X size={14} />
                                </button>
                            </div>
                        )}

                        {error && (
                            <div className={styles['error-message']}>
                                <AlertTriangle size={16} />
                                <span>{error}</span>
                                <button
                                    onClick={() => setError(null)}
                                    className={styles['close-btn']}>
                                    <X size={14} />
                                </button>
                            </div>
                        )}

                        {/* Profile Photo Section */}
                        <section className={styles['form-section']}>
                            <h2 className={styles['section-title']}>
                                Profile Photo
                            </h2>
                            <div className={styles['avatar-section']}>
                                <div className={styles['avatar-container']}>
                                    <div className={styles['avatar-wrapper']}>
                                        {formData.avatar ? (
                                            <img
                                                src={formData.avatar}
                                                alt="Profile"
                                                className={styles.avatar}
                                            />
                                        ) : (
                                            <div
                                                className={`${styles.avatar} ${styles['avatar-placeholder']}`}>
                                                <User size={32} />
                                            </div>
                                        )}
                                        <label
                                            className={styles['avatar-overlay']}
                                            htmlFor="avatar-upload">
                                            <Camera size={20} />
                                        </label>
                                        <input
                                            id="avatar-upload"
                                            type="file"
                                            accept="image/*"
                                            onChange={handleAvatarChange}
                                            style={{ display: 'none' }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Personal Information */}
                        <section className={styles['form-section']}>
                            <h2 className={styles['section-title']}>
                                Personal Information
                            </h2>
                            <div className={styles['form-grid']}>
                                {/* Full Name */}
                                <div
                                    className={styles['form-group']}
                                    ref={inputRefs.fullName}>
                                    <label className={styles.label}>
                                        <User size={16} />
                                        Full Name
                                    </label>
                                    {isEditing.fullName ? (
                                        <div
                                            className={styles['input-actions']}>
                                            <input
                                                type="text"
                                                value={tempValues.fullName}
                                                onChange={(e) =>
                                                    handleInputChange(
                                                        'fullName',
                                                        e.target.value
                                                    )
                                                }
                                                className={styles.input}
                                                autoFocus
                                            />
                                            <div
                                                className={
                                                    styles['action-buttons']
                                                }>
                                                <button
                                                    onClick={() =>
                                                        cancelEdit('fullName')
                                                    }
                                                    className={
                                                        styles['btn-cancel']
                                                    }>
                                                    <X size={14} />
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        saveEdit('fullName')
                                                    }
                                                    className={
                                                        styles['btn-save']
                                                    }>
                                                    <Check size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div
                                            className={styles['display-value']}
                                            onClick={() =>
                                                startEdit('fullName')
                                            }>
                                            <span>
                                                {formData.fullName ||
                                                    'Click to add your full name'}
                                            </span>
                                            <Edit2 size={14} />
                                        </div>
                                    )}
                                </div>

                                {/* Email - Now Editable */}
                                <div
                                    className={styles['form-group']}
                                    ref={inputRefs.email}>
                                    <label className={styles.label}>
                                        <Mail size={16} />
                                        Email
                                    </label>
                                    {isEditing.email ? (
                                        <div
                                            className={styles['input-actions']}>
                                            <input
                                                type="email"
                                                value={tempValues.email}
                                                onChange={(e) =>
                                                    handleInputChange(
                                                        'email',
                                                        e.target.value
                                                    )
                                                }
                                                className={styles.input}
                                                autoFocus
                                            />
                                            <div
                                                className={
                                                    styles['action-buttons']
                                                }>
                                                <button
                                                    onClick={() =>
                                                        cancelEdit('email')
                                                    }
                                                    className={
                                                        styles['btn-cancel']
                                                    }>
                                                    <X size={14} />
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        saveEdit('email')
                                                    }
                                                    className={
                                                        styles['btn-save']
                                                    }>
                                                    <Check size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div
                                            className={styles['display-value']}
                                            onClick={() => startEdit('email')}>
                                            <span>
                                                {formData.email ||
                                                    'Click to add your email'}
                                            </span>
                                            <Edit2 size={14} />
                                        </div>
                                    )}
                                </div>

                                {/* Phone Number */}
                                <div
                                    className={styles['form-group']}
                                    ref={inputRefs.phoneNumber}>
                                    <label className={styles.label}>
                                        <Phone size={16} />
                                        Phone Number
                                    </label>
                                    {isEditing.phoneNumber ? (
                                        <div
                                            className={styles['input-actions']}>
                                            <input
                                                type="tel"
                                                value={tempValues.phoneNumber}
                                                onChange={(e) =>
                                                    handleInputChange(
                                                        'phoneNumber',
                                                        e.target.value
                                                    )
                                                }
                                                className={styles.input}
                                                autoFocus
                                            />
                                            <div
                                                className={
                                                    styles['action-buttons']
                                                }>
                                                <button
                                                    onClick={() =>
                                                        cancelEdit(
                                                            'phoneNumber'
                                                        )
                                                    }
                                                    className={
                                                        styles['btn-cancel']
                                                    }>
                                                    <X size={14} />
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        saveEdit('phoneNumber')
                                                    }
                                                    className={
                                                        styles['btn-save']
                                                    }>
                                                    <Check size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div
                                            className={styles['display-value']}
                                            onClick={() =>
                                                startEdit('phoneNumber')
                                            }>
                                            <span>
                                                {formData.phoneNumber ||
                                                    'Click to add your phone number'}
                                            </span>
                                            <Edit2 size={14} />
                                        </div>
                                    )}
                                </div>

                                {/* Address */}
                                <div
                                    className={`${styles['form-group']} ${styles['form-group-full']}`}
                                    ref={inputRefs.address}>
                                    <label className={styles.label}>
                                        <MapPin size={16} />
                                        Address
                                    </label>
                                    {isEditing.address ? (
                                        <div
                                            className={styles['input-actions']}>
                                            <div
                                                className={
                                                    styles[
                                                        'address-input-wrapper'
                                                    ]
                                                }>
                                                <input
                                                    type="text"
                                                    value={tempValues.address}
                                                    onChange={(e) =>
                                                        handleInputChange(
                                                            'address',
                                                            e.target.value
                                                        )
                                                    }
                                                    className={styles.input}
                                                    placeholder="Enter your address"
                                                    autoFocus
                                                />
                                                <button
                                                    onClick={
                                                        handleGetCurrentLocation
                                                    }
                                                    className={
                                                        styles['location-btn']
                                                    }
                                                    disabled={
                                                        isGettingCurrentLocation
                                                    }
                                                    type="button">
                                                    {isGettingCurrentLocation ? (
                                                        <Loader2
                                                            size={14}
                                                            className="spinning"
                                                        />
                                                    ) : (
                                                        <MapPin size={14} />
                                                    )}
                                                </button>
                                            </div>
                                            <div
                                                className={
                                                    styles['action-buttons']
                                                }>
                                                <button
                                                    onClick={() =>
                                                        cancelEdit('address')
                                                    }
                                                    className={
                                                        styles['btn-cancel']
                                                    }>
                                                    <X size={14} />
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        saveEdit('address')
                                                    }
                                                    className={
                                                        styles['btn-save']
                                                    }>
                                                    <Check size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div
                                            className={styles['display-value']}
                                            onClick={() =>
                                                startEdit('address')
                                            }>
                                            <span>
                                                {formData.address ||
                                                    'Click to add your address'}
                                            </span>
                                            <Edit2 size={14} />
                                        </div>
                                    )}
                                </div>

                                {/* Bio */}
                                <div
                                    className={`${styles['form-group']} ${styles['form-group-full']}`}
                                    ref={inputRefs.bio}>
                                    <label className={styles.label}>Bio</label>
                                    {isEditing.bio ? (
                                        <div
                                            className={styles['input-actions']}>
                                            <textarea
                                                value={tempValues.bio}
                                                onChange={(e) =>
                                                    handleInputChange(
                                                        'bio',
                                                        e.target.value
                                                    )
                                                }
                                                className={styles.textarea}
                                                placeholder="Tell us about yourself"
                                                rows="4"
                                                autoFocus
                                            />
                                            <div
                                                className={
                                                    styles['action-buttons']
                                                }>
                                                <button
                                                    onClick={() =>
                                                        cancelEdit('bio')
                                                    }
                                                    className={
                                                        styles['btn-cancel']
                                                    }>
                                                    <X size={14} />
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        saveEdit('bio')
                                                    }
                                                    className={
                                                        styles['btn-save']
                                                    }>
                                                    <Check size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div
                                            className={styles['display-value']}
                                            onClick={() => startEdit('bio')}>
                                            <span>
                                                {formData.bio ||
                                                    'Click to add a bio'}
                                            </span>
                                            <Edit2 size={14} />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </section>

                        {/* KYC Verification Section */}
                        <section className={styles['form-section']}>
                            <div className={styles['kyc-header']}>
                                <h2 className={styles['section-title']}>
                                    <Shield size={20} />
                                    KYC Verification
                                </h2>

                                {/* KYC Status Badge */}
                                <div
                                    className={`${styles['kyc-status-badge']} ${
                                        styles[
                                            `kyc-${formData.verificationStatus}`
                                        ]
                                    }`}>
                                    {isCheckingKyc ? (
                                        <>
                                            <Loader2
                                                size={14}
                                                className="spinning"
                                            />
                                            <span>Checking...</span>
                                        </>
                                    ) : (
                                        <>
                                            {formData.verificationStatus ===
                                                'pending' && (
                                                <>
                                                    <Clock size={14} />
                                                    <span>Under Review</span>
                                                </>
                                            )}
                                            {formData.verificationStatus ===
                                                'not_applied' && (
                                                <>
                                                    <AlertTriangle size={14} />
                                                    <span>Not Applied</span>
                                                </>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>

                            <p className={styles['kyc-description']}>
                                Complete your identity verification to unlock
                                all features, including voting and commenting on
                                news articles.
                            </p>

                            <div className={styles['kyc-form']}>
                                <div className={styles['file-upload-section']}>
                                    <label
                                        htmlFor="citizenship-upload"
                                        className={styles['file-upload-label']}>
                                        <div
                                            className={
                                                styles['file-upload-content']
                                            }>
                                            {formData.citizenshipPhoto ? (
                                                <div
                                                    className={
                                                        styles['file-preview']
                                                    }>
                                                    <img
                                                        src={
                                                            formData.citizenshipPhoto
                                                        }
                                                        alt="Citizenship Document"
                                                        className={
                                                            styles[
                                                                'preview-image'
                                                            ]
                                                        }
                                                    />
                                                    <div
                                                        className={
                                                            styles['file-info']
                                                        }>
                                                        <Check size={16} />
                                                        <span>
                                                            Document uploaded
                                                        </span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div
                                                    className={
                                                        styles[
                                                            'file-upload-placeholder'
                                                        ]
                                                    }>
                                                    <Upload size={32} />
                                                    <h4>
                                                        Upload Citizenship
                                                        Document
                                                    </h4>
                                                    <p>PNG, JPG up to 10MB</p>
                                                </div>
                                            )}
                                        </div>
                                        <input
                                            type="file"
                                            id="citizenship-upload"
                                            accept="image/*"
                                            onChange={
                                                handleVerificationFileChange
                                            }
                                            style={{ display: 'none' }}
                                            disabled={
                                                formData.verificationStatus ===
                                                'pending'
                                            }
                                        />
                                    </label>
                                </div>

                                {formData.citizenshipPhoto && (
                                    <div
                                        className={
                                            styles['kyc-submit-section']
                                        }>
                                        <button
                                            onClick={handleKycVerification}
                                            disabled={
                                                isSubmittingKyc ||
                                                !formData.citizenshipPhotoFile ||
                                                formData.verificationStatus ===
                                                    'pending'
                                            }
                                            className={
                                                styles['kyc-submit-btn']
                                            }>
                                            {isSubmittingKyc ? (
                                                <>
                                                    <Loader2
                                                        size={16}
                                                        className="spinning"
                                                        style={{
                                                            marginRight: '8px',
                                                        }}
                                                    />
                                                    Submitting to Admin...
                                                </>
                                            ) : formData.verificationStatus ===
                                              'pending' ? (
                                                <>
                                                    <Clock
                                                        size={16}
                                                        style={{
                                                            marginRight: '8px',
                                                        }}
                                                    />
                                                    Under Admin Review
                                                </>
                                            ) : (
                                                <>
                                                    <Send
                                                        size={16}
                                                        style={{
                                                            marginRight: '8px',
                                                        }}
                                                    />
                                                    Submit for Verification
                                                </>
                                            )}
                                        </button>
                                        <p
                                            className={
                                                styles['kyc-submit-note']
                                            }>
                                            {formData.verificationStatus ===
                                            'pending'
                                                ? 'Your document is being reviewed by our admin team. We will notify you once verification is complete.'
                                                : 'Once submitted, your document will be sent to the admin panel for review.'}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* Save Button */}
                        <div className={styles['form-actions']}>
                            <button
                                className={styles['reset-btn']}
                                onClick={() => window.location.reload()}
                                type="button">
                                Reset
                            </button>
                            <button
                                className={styles['save-btn']}
                                onClick={handleSave}
                                disabled={isUpdating}>
                                {isUpdating ? (
                                    <>
                                        <Loader2
                                            size={16}
                                            className="spinning"
                                            style={{ marginRight: '0.5rem' }}
                                        />
                                        Saving...
                                    </>
                                ) : (
                                    'Save Changes'
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Column - Metrics & Status (Only show if not verified) */}
                <div className={styles['profile-sidebar-right']}>
                    <ProfileMetrics
                        completionPercentage={percentage}
                        verificationStatus={formData.verificationStatus}
                        metrics={metrics}
                    />

                    <VerificationStatus
                        status={formData.verificationStatus}
                        verificationDate={formData.verificationDate}
                        message={
                            formData.verificationStatus === 'pending'
                                ? 'Your verification is under admin review. This usually takes 24-48 hours.'
                                : 'Upload your citizenship document to start the verification process.'
                        }
                    />
                </div>
            </div>
        </div>
    );
};

export default Profile;
