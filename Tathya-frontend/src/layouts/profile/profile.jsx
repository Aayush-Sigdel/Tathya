import React, { useCallback, useEffect, useState, useRef } from "react";
import { Camera, Edit3, Loader2, Navigation, Shield, FileText, X } from 'lucide-react';
import ProfileMetrics from './ProfileMetrics';
import VerificationStatus from './VerificationStatus';
import styles from './profile.module.css';

const Profile = ({ userInfo, onUpdateProfile, sidebarCollapsed = false }) => {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phoneNumber: '',
        address: '',
        bio:'',
        coordinates: null,
        avatar: null,
        profileImageFile: null,
        citizenshipPhoto: null,
        citizenshipPhotoFile: null,
        verificationStatus: 'pending',
        verificationDate: null
    });

    const [isEditing, setIsEditing] = useState({
        fullName: false,
        email: false,
        phoneNumber: false,
        address: false,
        bio: false
    });

    const [tempValues, setTempValues] = useState({
        fullName: '',
        email: '',
        phoneNumber: '',
        address: '',
        bio: ''
    });

    const inputRefs = {
        fullName: useRef(null),
        email: useRef(null),
        phoneNumber: useRef(null),
        address: useRef(null),
        bio: useRef(null),
    };

    const [locationSearch, setLocationSearch] = useState('');
    const [isGettingCurrentLocation, setIsGettingCurrentLocation] = useState(false);
    const [error, setError] = useState(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    // Calculate profile completion with only 5 metrics
    const calculateProfileCompletion = () => {
        const fields = [
            { key: 'fullName', weight: 20, label: 'Full Name', value: '20%' },
            { key: 'email', weight: 20, label: 'Email', value: '20%' },
            { key: 'phoneNumber', weight: 20, label: 'Phone Number', value: '20%' },
            { key: 'address', weight: 20, label: 'Location', value: '20%' },
            { key: 'avatar', weight: 20, label: 'Upload your photo', value: '20%' },
        ];

        let completedPercentage = 0;
        const metrics = fields.map(field => {
            const isCompleted = !!formData[field.key];
            if (isCompleted) {
                completedPercentage += field.weight;
            }
            return {
                label: field.label,
                value: field.value,
                completed: isCompleted
            };
        });

        return { percentage: completedPercentage, metrics };
    };

    useEffect(() => {
        const loadProfile = async () => {
            try {
                await fetchProfile();
            } catch (error) {
                console.error('Failed to load profile on mount:', error);
            }
        };
        loadProfile();
    }, []);

    // Click outside handler
    useEffect(() => {
        const handleClickOutside = (event) => {
            Object.keys(inputRefs).forEach(field => {
                if (isEditing[field] && inputRefs[field].current && !inputRefs[field].current.contains(event.target)) {
                    cancelEdit(field);
                }
            });
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isEditing]);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        setError(null);
        setSuccessMessage('');
    };

    const startEdit = (field) => {
        setTempValues(prev => ({
            ...prev,
            [field]: formData[field]
        }));
        setIsEditing(prev => ({
            ...prev,
            [field]: true
        }));
        setTimeout(() => {
            inputRefs[field]?.current?.focus();
        }, 0);
    };

    const cancelEdit = (field) => {
        setIsEditing(prev => ({
            ...prev,
            [field]: false
        }));
        // Reset to original value
        if (field === 'address') {
            setLocationSearch(formData.address);
        }
    };

    const saveEdit = (field) => {
        setIsEditing(prev => ({
            ...prev,
            [field]: false
        }));
    };

    const getJWTFromCookie = () => {
        const name = "Access=";
        const decodedCookie = decodeURIComponent(document.cookie);
        const cookieArray = decodedCookie.split(';');

        for (let i = 0; i < cookieArray.length; i++) {
            let cookie = cookieArray[i].trim();
            if (cookie.indexOf(name) === 0) {
                return cookie.substring(name.length, cookie.length);
            }
        }
        return null;
    };

    const getProfileImageUrl = (dbPath) => {
        if (!dbPath) return null;
        const cleanPath = dbPath.startsWith('/') ? dbPath.substring(1) : dbPath;
        return `http://localhost:8080/${cleanPath}`;
    };

    const getFileUrl = (filename) => {
        if (!filename) return null;
        const cleanPath = filename.startsWith('/') ? filename.substring(1) : filename;
        return `http://localhost:8080/${cleanPath}`;
    };

    const fetchProfile = async () => {
    try {
        const email = localStorage.getItem('userEmail');
        if (!email) {
            console.error('No email found in localStorage');
            return;
        }

        const response = await fetch(`api/users/profile?email=${email}`, {
            method: 'GET',
            credentials: 'include',
        });

        if (response.ok) {
            const data = await response.json();

            const avatarUrl = getProfileImageUrl(data.profileImagePath);
            const docUrl = getFileUrl(data.documentPath);

            setFormData(prev => ({
                ...prev,
                fullName: data.username || '',
                email: data.email || '',
                phoneNumber: data.phone || '',
                address: data.address || '',
                avatar: avatarUrl || null,
                citizenshipPhoto: docUrl || null,
                verificationStatus: data.status || 'pending',
                verificationDate: data.verifiedAt || null,
                bio: data.bio || ''  // ADD THIS
            }));

            setLocationSearch(data.address || '');

            if (data.username) localStorage.setItem('userName', data.username);
            if (data.email) localStorage.setItem('userEmail', data.email);
        } else {
            console.error('Failed to fetch profile:', response.status);
        }
    } catch (error) {
        console.error('Error fetching profile:', error);
    }
};

    const updateProfileOnBackend = async () => {
        const formDataToSend = new FormData();

        formDataToSend.append('email', formData.email);

        if (formData.phoneNumber?.trim()) {
            formDataToSend.append('phone', formData.phoneNumber);
        }

        if (formData.address?.trim()) {
            formDataToSend.append('address', formData.address);
        }

        if (formData.bio?.trim()) {
        formDataToSend.append('bio', formData.bio);  // ADD THIS
    }

        if (formData.coordinates?.lat) {
            formDataToSend.append('latitude', formData.coordinates.lat.toString());
        }

        if (formData.coordinates?.lon) {
            formDataToSend.append('longitude', formData.coordinates.lon.toString());
        }

        if (formData.profileImageFile) {
            formDataToSend.append('profile_image', formData.profileImageFile);
        }

        if (formData.citizenshipPhotoFile) {
            formDataToSend.append('valid_doc', formData.citizenshipPhotoFile);
        }

        const token = getJWTFromCookie();

        try {
            const response = await fetch('api/users/update-profile', {
                method: 'POST',
                headers: {
                    ...(token && { 'Authorization': `Bearer ${token}` }),
                },
                credentials: 'include',
                body: formDataToSend,
            });

            if (response.ok) {
                const result = await response.text();
                setSuccessMessage(result);
                setError(null);

                if (formData.fullName) {
                    localStorage.setItem('userName', formData.fullName);
                }
                if (formData.email) {
                    localStorage.setItem('userEmail', formData.email);
                }

                if (onUpdateProfile) {
                    onUpdateProfile(formData);
                }
            } else if (response.status === 401) {
                throw new Error('Session expired or invalid. Please login again.');
            } else {
                const errorText = await response.text();
                throw new Error(errorText || 'Failed to update profile');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            setError(error.message || 'Failed to update profile. Please try again.');
            setSuccessMessage('');
        }
    };

    const handleSave = async () => {
        if (!formData.email?.trim()) {
            setError('Email is required to update profile');
            return;
        }

        setIsUpdating(true);
        setError(null);
        setSuccessMessage('');

        try {
            await updateProfileOnBackend();
        } catch (error) {
            console.error('Save operation failed:', error);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleAvatarChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            handleInputChange('profileImageFile', file);

            const reader = new FileReader();
            reader.onload = (e) => {
                handleInputChange('avatar', e.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleVerificationFileChange = (event, fieldName) => {
        const file = event.target.files[0];
        if (file) {
            if (fieldName === 'citizenshipPhoto') {
                handleInputChange('citizenshipPhotoFile', file);
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                handleInputChange(fieldName, e.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleGetCurrentLocation = async () => {
        setIsGettingCurrentLocation(true);
        setError(null);

        try {
            const permission = await navigator.permissions.query({
                name: 'geolocation',
            });

            if (permission.state === 'granted' || permission.state === 'prompt') {
                navigator.geolocation.getCurrentPosition(
                    async (position) => {
                        const { latitude, longitude } = position.coords;

                        try {
                            const response = await fetch(
                                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
                            );
                            const data = await response.json();

                            const address = data.display_name || `${latitude}, ${longitude}`;
                            
                            handleInputChange('address', address);
                            handleInputChange('coordinates', { lat: latitude, lon: longitude });
                            setLocationSearch(address);

                            setSuccessMessage('Location detected successfully!');
                        } catch (error) {
                            console.error('Reverse geocoding error:', error);
                            handleInputChange('address', `${latitude}, ${longitude}`);
                            handleInputChange('coordinates', { lat: latitude, lon: longitude });
                        }

                        setIsGettingCurrentLocation(false);
                    },
                    (error) => {
                        console.error('Geolocation error:', error);
                        setError('Unable to detect location. Please enter manually.');
                        setIsGettingCurrentLocation(false);
                    }
                );
            } else {
                alert('Location permission denied. Please enable it in settings.');
                setIsGettingCurrentLocation(false);
            }
        } catch (error) {
            console.error('Location request error:', error);
            setError('Location permission denied or unavailable.');
            setIsGettingCurrentLocation(false);
        }
    };

    const { percentage, metrics } = calculateProfileCompletion();

    return (
        <div className={`${styles["profile-wrapper"]} ${sidebarCollapsed ? styles["sidebar-collapsed"] : ''}`}>
            <div className={styles["profile-layout"]}>
                {/* Left Column - Profile Form */}
                <div className={styles["profile-main"]}>
                    <div className={styles["profile-form"]}>
                        <div className={styles["profile-header"]}>
                            <h1 className={styles["profile-title"]}>Edit Profile</h1>
                            <p className={styles["profile-subtitle"]}>Update your personal information</p>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className={styles["error-message"]}>
                                <span>{error}</span>
                                <button onClick={() => setError(null)}>×</button>
                            </div>
                        )}

                        {/* Success Message */}
                        {successMessage && (
                            <div className={styles["success-message"]}>
                                <span>{successMessage}</span>
                                <button onClick={() => setSuccessMessage('')}>×</button>
                            </div>
                        )}

                        {/* Profile picture section */}
                        <div className={styles["profile-picture-section"]}>
                            <div className={styles["profile-picture-container"]}>
                                <div className={styles["profile-picture"]}>
                                    {formData.avatar ? (
                                        <img src={formData.avatar} className={styles["profile-image"]} alt="Profile Avatar" />
                                    ) : (
                                        <div className={styles["profile-placeholder"]}>
                                            <label htmlFor="avatar-upload" className={styles["camera-placeholder"]}>
                                                <Camera size={40} />
                                                <input
                                                    type='file'
                                                    id="avatar-upload"
                                                    accept="image/*"
                                                    onChange={handleAvatarChange}
                                                    style={{ display: 'none' }}
                                                />
                                            </label>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className={styles["upload-info"]}>
                                <h3 className={styles["upload-title"]}>Upload new photo</h3>
                                <p className={styles["upload-subtitle"]}>
                                    At least 800×800 px recommended.<br/>
                                    JPG or PNG is allowed
                                </p>
                            </div>
                        </div>

                        {/* Account Information */}
                        <section className={styles["form-section"]}>
                            <div className={styles["section-header"]}>
                                <h3 className={styles["section-title"]}>Personal Info</h3>
                            </div>

                            <div className={styles["form-grid"]}>
                                <div className={styles["form-group"]}>
                                    <label className={styles["form-label"]}>Full Name</label>
                                    <div className={styles["input-with-edit"]} ref={inputRefs.fullName}>
                                        {isEditing.fullName ? (
                                            <div className={styles["editable-input-wrapper"]}>
                                                <input
                                                    type="text"
                                                    className={styles["form-input"]}
                                                    value={formData.fullName}
                                                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                                                    placeholder="Enter your full name"
                                                />
                                                <button
                                                    className={styles["cancel-edit-btn"]}
                                                    onClick={() => cancelEdit('fullName')}
                                                    type="button"
                                                >
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        ) : (
                                            <div 
                                                className={styles["form-display-clickable"]}
                                                onClick={() => startEdit('fullName')}
                                            >
                                                <span>{formData.fullName || 'Not Provided'}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className={styles["form-group"]}>
                                    <label className={styles["form-label"]}>Email</label>
                                    <div className={styles["input-with-edit"]} ref={inputRefs.email}>
                                        {isEditing.email ? (
                                            <div className={styles["editable-input-wrapper"]}>
                                                <input
                                                    type="email"
                                                    className={styles["form-input"]}
                                                    value={formData.email}
                                                    onChange={(e) => handleInputChange('email', e.target.value)}
                                                    placeholder="Enter your email"
                                                />
                                                <button
                                                    className={styles["cancel-edit-btn"]}
                                                    onClick={() => cancelEdit('email')}
                                                    type="button"
                                                >
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        ) : (
                                            <div 
                                                className={styles["form-display-clickable"]}
                                                onClick={() => startEdit('email')}
                                            >
                                                <span>{formData.email || 'Not Provided'}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className={styles["form-group"]}>
                                    <label className={styles["form-label"]}>Phone</label>
                                    <div className={styles["input-with-edit"]} ref={inputRefs.phoneNumber}>
                                        {isEditing.phoneNumber ? (
                                            <div className={styles["editable-input-wrapper"]}>
                                                <input
                                                    type="tel"
                                                    className={styles["form-input"]}
                                                    value={formData.phoneNumber}
                                                    onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                                                    placeholder="Enter your phone number"
                                                />
                                                <button
                                                    className={styles["cancel-edit-btn"]}
                                                    onClick={() => cancelEdit('phoneNumber')}
                                                    type="button"
                                                >
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        ) : (
                                            <div 
                                                className={styles["form-display-clickable"]}
                                                onClick={() => startEdit('phoneNumber')}
                                            >
                                                <span>{formData.phoneNumber || 'Not Provided'}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Location Section */}
                        <section className={styles["form-section"]}>
                            <div className={styles["section-header"]}>
                                <h3 className={styles["section-title"]}>Location</h3>
                            </div>

                            <div className={styles["form-group"]}>
                                <div className={styles["location-input-wrapper"]} ref={inputRefs.address}>
                                    {isEditing.address ? (
                                        <div className={styles["editable-input-wrapper"]}>
                                            <div className={styles["location-search"]}>
                                                <input
                                                    type="text"
                                                    className={styles["form-input"]}
                                                    value={locationSearch}
                                                    onChange={(e) => {
                                                        setLocationSearch(e.target.value);
                                                        handleInputChange('address', e.target.value);
                                                    }}
                                                    placeholder="Enter address or use location button"
                                                />
                                                <button
                                                    className={styles["current-location-btn"]}
                                                    onClick={handleGetCurrentLocation}
                                                    disabled={isGettingCurrentLocation}
                                                    type="button"
                                                    title="Detect current location"
                                                >
                                                    {isGettingCurrentLocation ? (
                                                        <Loader2 size={16} className="spinning" />
                                                    ) : (
                                                        <Navigation size={16} />
                                                    )}
                                                </button>
                                            </div>
                                            <button
                                                className={styles["cancel-edit-btn-absolute"]}
                                                onClick={() => cancelEdit('address')}
                                                type="button"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    ) : (
                                        <div 
                                            className={styles["form-display-clickable"]}
                                            onClick={() => startEdit('address')}
                                        >
                                            <span>{formData.address || 'Not Provided'}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </section>

                        {/* Bio Section */}
                        <section className={styles["form-section"]}>
                            <div className={styles["section-header"]}>
                                <h3 className={styles["section-title"]}>Bio (Optional)</h3>
                            </div>
                            <div className={styles["form-group"]}>
                                <div className={styles["input-with-edit"]} ref={inputRefs.bio}>
                                    
                                        <div className={styles["editable-input-wrapper"]}>
                                            <textarea
                                                className={styles["form-textarea"]}
                                                value={formData.bio}
                                                onChange={(e) => handleInputChange('bio', e.target.value)}
                                                placeholder="Tell us about yourself"
                                                rows={4}
                                            />
                                    </div>
                                
                            </div>
                        </div>
                    </section>

                        {/* Verification Section */}
                        <section className={styles["form-section"]}>
                            <h3 className={styles["section-title"]}>
                                <Shield size={20} style={{ marginRight: '0.5rem' }} />
                                Verification Documents
                            </h3>
                            <p className={styles["section-description"]}>
                                Upload verification documents to increase trust and credibility.
                            </p>

                            <div className={styles["verification-grid"]}>
                                <div className={styles["verification-item"]}>
                                    <label className={styles["form-label"]}>
                                        <FileText size={16} style={{ marginRight: '0.5rem' }} />
                                        Identity Document
                                    </label>
                                    <div className={styles["file-upload-container"]}>
                                        <div className={styles["file-upload-area"]}>
                                            {formData.citizenshipPhoto ? (
                                                <div className={styles["uploaded-image"]}>
                                                    <img
                                                        src={formData.citizenshipPhoto}
                                                        alt="Identity Document"
                                                        className={styles["verification-image"]}
                                                    />
                                                    <div className={styles["image-overlay"]}>
                                                        <label htmlFor="citizenship-upload" className={styles["change-image-btn"]}>
                                                            <Camera size={16} />
                                                            Change
                                                        </label>
                                                    </div>
                                                </div>
                                            ) : (
                                                <label htmlFor="citizenship-upload" className={styles["upload-placeholder"]}>
                                                    <Camera size={32} />
                                                    <span>Upload Document</span>
                                                    <small>JPG, PNG up to 5MB</small>
                                                </label>
                                            )}
                                            <input
                                                type="file"
                                                id="citizenship-upload"
                                                accept="image/*"
                                                onChange={(e) => handleVerificationFileChange(e, 'citizenshipPhoto')}
                                                style={{ display: 'none' }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                        

                        {/* Save Button */}
                        <div className={styles["form-actions"]}>
                            <button
                                className={styles["reset-btn"]}
                                onClick={() => window.location.reload()}
                                type="button"
                            >
                                Reset
                            </button>
                            <button
                                className={styles["save-btn"]}
                                onClick={handleSave}
                                disabled={isUpdating}
                            >
                                {isUpdating ? (
                                    <>
                                        <Loader2 size={16} className="spinning" style={{ marginRight: '0.5rem' }} />
                                        Saving...
                                    </>
                                ) : (
                                    'Save Changes'
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Column - Metrics & Status */}
                <div className={styles["profile-sidebar-right"]}>
                    <ProfileMetrics 
                        completionPercentage={percentage}
                        verificationStatus={formData.verificationStatus}
                        metrics={metrics}
                    />
                    
                    <VerificationStatus 
                        status={formData.verificationStatus}
                        verificationDate={formData.verificationDate}
                    />
                </div>
            </div>
        </div>
    );
};

export default Profile;