// API base URL - using the same as the existing services
const API_BASE_URL = 'http://localhost:8080';

/**
 * KYC Verification Service
 * Handles KYC verification checks for user actions with localStorage management
 */
export class KYCService {
    /**
     * Check if a user is KYC verified
     * @param {string} email - User's email address
     * @returns {Promise<boolean>} KYC verification status
     */
    static async isKycVerified(email) {
        try {
            if (!email) {
                console.warn('No email provided for KYC verification');
                return false;
            }

            const params = new URLSearchParams({
                email: email,
            });

            const response = await fetch(
                `${API_BASE_URL}/users/is-kyc-verified?${params}`,
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

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const isVerified = await response.json();

            // Update localStorage with the latest status
            localStorage.setItem('kycVerified', isVerified.toString());
            localStorage.setItem('kycLastChecked', new Date().toISOString());

            return Boolean(isVerified);
        } catch (error) {
            console.error('Failed to check KYC verification:', error);
            // Return cached value on error
            return localStorage.getItem('kycVerified') === 'true';
        }
    }

    /**
     * Get the current user's email from localStorage
     * @returns {string|null} User's email or null if not found
     */
    static getCurrentUserEmail() {
        return localStorage.getItem('userEmail');
    }

    /**
     * Check if current user is logged in
     * @returns {boolean} Whether user is logged in
     */
    static isLoggedIn() {
        const token = localStorage.getItem('accessToken');
        const email = localStorage.getItem('userEmail');
        return !!(token && email);
    }

    /**
     * Get cached KYC status from localStorage
     * @returns {boolean} Cached KYC verification status
     */
    static getCachedKycStatus() {
        return localStorage.getItem('kycVerified') === 'true';
    }

    /**
     * Check if current user is KYC verified (with caching)
     * @param {boolean} forceRefresh - Force check from server
     * @returns {Promise<boolean>} KYC verification status for current user
     */
    static async isCurrentUserKycVerified(forceRefresh = false) {
        const email = this.getCurrentUserEmail();
        if (!email) {
            return false;
        }

        // Check if we need to refresh from server
        const lastChecked = localStorage.getItem('kycLastChecked');
        const cacheAge = lastChecked
            ? Date.now() - new Date(lastChecked).getTime()
            : Infinity;
        const cacheExpired = cacheAge > 30000; // Cache for 30 seconds

        if (!forceRefresh && !cacheExpired && lastChecked) {
            return this.getCachedKycStatus();
        }

        return this.isKycVerified(email);
    }

    /**
     * Submit KYC verification document
     * @param {string} email - User's email
     * @param {File} documentFile - KYC document file
     * @returns {Promise<string>} Response message
     */
    static async submitKycVerification(email, documentFile) {
        try {
            if (!email || !documentFile) {
                throw new Error('Email and document file are required');
            }

            const formData = new FormData();
            formData.append('email', email);
            formData.append('valid_doc', documentFile);

            const response = await fetch(`${API_BASE_URL}/users/verify-kyc`, {
                method: 'POST',
                body: formData,
                headers: {
                    Authorization: `Bearer ${
                        localStorage.getItem('accessToken') || ''
                    }`,
                },
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Failed to submit KYC document');
            }

            const result = await response.text();

            // Update localStorage to indicate pending status
            localStorage.setItem('kycVerified', 'false');
            localStorage.setItem('kycStatus', 'pending');
            localStorage.setItem('kycSubmittedAt', new Date().toISOString());

            return result;
        } catch (error) {
            console.error('Failed to submit KYC verification:', error);
            throw error;
        }
    }

    /**
     * Start periodic KYC status checking
     * @param {function} onStatusChange - Callback when status changes
     * @returns {number} Interval ID for clearing
     */
    static startPeriodicCheck(onStatusChange) {
        const checkInterval = 30000; // Check every 30 seconds

        const intervalId = setInterval(async () => {
            const email = this.getCurrentUserEmail();
            if (!email) {
                clearInterval(intervalId);
                return;
            }

            const currentStatus = this.getCachedKycStatus();

            try {
                const newStatus = await this.isKycVerified(email);

                if (newStatus !== currentStatus && onStatusChange) {
                    onStatusChange(newStatus, currentStatus);
                }
            } catch (error) {
                console.error('Error during periodic KYC check:', error);
            }
        }, checkInterval);

        return intervalId;
    }

    /**
     * Initialize KYC monitoring for the application
     * @param {function} onStatusChange - Callback when status changes
     */
    static initializeKycMonitoring(onStatusChange) {
        // Check immediately on initialization
        this.isCurrentUserKycVerified(true).then((status) => {
            if (onStatusChange) {
                onStatusChange(status, null);
            }
        });

        // Start periodic checking
        const intervalId = this.startPeriodicCheck(onStatusChange);

        // Check when page becomes visible
        const handleVisibilityChange = () => {
            if (!document.hidden && this.isLoggedIn()) {
                this.isCurrentUserKycVerified(true);
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        // Return cleanup function
        return () => {
            clearInterval(intervalId);
            document.removeEventListener(
                'visibilitychange',
                handleVisibilityChange
            );
        };
    }
}

/**
 * Utility functions for KYC-related checks
 */
export const KYCUtils = {
    /**
     * Show appropriate message for KYC verification requirement
     * @param {string} action - The action being attempted (e.g., "vote", "comment")
     */
    showKycRequiredMessage(action = 'perform this action') {
        const message = `You need to complete KYC verification to ${action}. Please visit your profile to complete the verification process.`;
        alert(message);
        console.warn('KYC verification required for action:', action);
    },

    /**
     * Show appropriate message for login requirement
     * @param {string} action - The action being attempted
     */
    showLoginRequiredMessage(action = 'perform this action') {
        const message = `You need to login to ${action}. Please sign in and complete KYC verification.`;
        alert(message);
        console.warn('Login required for action:', action);
    },

    /**
     * Check if user can perform action (logged in + KYC verified)
     * @param {string} action - Action description for error messages
     * @returns {Promise<boolean>} Whether user can perform the action
     */
    async canPerformAction(action = 'perform this action') {
        // First check if user is logged in
        if (!KYCService.isLoggedIn()) {
            this.showLoginRequiredMessage(action);
            return false;
        }

        // Check KYC verification (use cached status for performance)
        const isVerified = await KYCService.isCurrentUserKycVerified();
        if (!isVerified) {
            this.showKycRequiredMessage(action);
            return false;
        }

        return true;
    },

    /**
     * Get KYC status for display purposes
     * @returns {string} Status string ('verified', 'pending', 'not_applied')
     */
    getKycStatusDisplay() {
        const kycVerified = localStorage.getItem('kycVerified') === 'true';
        const kycStatus = localStorage.getItem('kycStatus');

        if (kycVerified) {
            return 'verified';
        } else if (kycStatus === 'pending') {
            return 'pending';
        } else {
            return 'not_applied';
        }
    },

    /**
     * Clear all KYC related localStorage data
     */
    clearKycCache() {
        localStorage.removeItem('kycVerified');
        localStorage.removeItem('kycStatus');
        localStorage.removeItem('kycLastChecked');
        localStorage.removeItem('kycSubmittedAt');
        localStorage.removeItem('kycVerificationDate');
    },
};

export default KYCService;
