/**
 * Comment Service - Handles all comment-related API interactions
 * Integrates with backend endpoints:
 * - POST /comment/post - Submit new comments
 * - GET /comment/getAllByNews - Get comments for a news article
 * - DELETE /comment/delete/{commentId} - Delete a comment
 */

// Comment Service Class
export class CommentService {
    static baseUrl = 'http://localhost:8080/comment';
    static USER_COMMENTS_KEY = 'userComments'; // localStorage key for user's comments
    static COMMENT_CACHE_KEY = 'commentCache'; // localStorage key for comment cache

    /**
     * Get authentication headers with JWT token
     */
    static getAuthHeaders() {
        const token = localStorage.getItem('accessToken');
        console.log('Auth Token Check:', {
            hasToken: !!token,
            tokenLength: token ? token.length : 0,
            tokenPreview: token ? `${token.substring(0, 20)}...` : 'No token',
        });

        return {
            'Content-Type': 'application/json',
            Authorization: token ? `Bearer ${token}` : '',
        };
    }

    /**
     * Store user's comment in localStorage for tracking
     * @param {Object} comment - Comment object from backend
     * @param {string} newsId - News article ID
     */
    static storeUserComment(comment, newsId) {
        try {
            const userEmail = localStorage.getItem('userEmail');
            if (!userEmail || !comment) return;

            // Get existing user comments
            const userComments = this.getUserComments();

            // Create comment entry with all necessary data
            const commentEntry = {
                commentId: comment.id || comment.commentId,
                newsId: newsId,
                content: comment.content,
                displayName:
                    comment.userDto?.name ||
                    comment.userName ||
                    localStorage.getItem('userName') ||
                    'You',
                userEmail: userEmail,
                userId: comment.userDto?.id || comment.userId,
                createdAt: comment.createdAt || new Date().toISOString(),
                updatedAt:
                    comment.updatedAt ||
                    comment.createdAt ||
                    new Date().toISOString(),
                // Store additional metadata
                metadata: {
                    newsTitle: document.title || 'Unknown Article',
                    timestamp: Date.now(),
                    browserSession:
                        sessionStorage.getItem('sessionId') || 'unknown',
                },
            };

            // Add to user comments array
            userComments.push(commentEntry);

            // Store back in localStorage
            localStorage.setItem(
                this.USER_COMMENTS_KEY,
                JSON.stringify(userComments)
            );

            console.log('✅ User comment stored:', commentEntry);
            console.log('📊 Total user comments:', userComments.length);
        } catch (error) {
            console.error('Error storing user comment:', error);
        }
    }

    /**
     * Get all user's comments from localStorage
     * @returns {Array} Array of user's comments
     */
    static getUserComments() {
        try {
            const stored = localStorage.getItem(this.USER_COMMENTS_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error getting user comments:', error);
            return [];
        }
    }

    /**
     * Get user's comments for a specific news article
     * @param {string} newsId - News article ID
     * @returns {Array} Array of user's comments for this article
     */
    static getUserCommentsForNews(newsId) {
        const userComments = this.getUserComments();
        return userComments.filter((comment) => comment.newsId === newsId);
    }

    /**
     * Check if user owns a specific comment
     * @param {string} commentId - Comment ID
     * @returns {boolean} True if user owns the comment
     */
    static isUserComment(commentId) {
        const userComments = this.getUserComments();
        return userComments.some((comment) => comment.commentId === commentId);
    }

    /**
     * Remove user comment from localStorage (when deleted)
     * @param {string} commentId - Comment ID to remove
     */
    static removeUserComment(commentId) {
        try {
            const userComments = this.getUserComments();
            const filteredComments = userComments.filter(
                (comment) => comment.commentId !== commentId
            );
            localStorage.setItem(
                this.USER_COMMENTS_KEY,
                JSON.stringify(filteredComments)
            );
            console.log('✅ User comment removed from storage:', commentId);
        } catch (error) {
            console.error('Error removing user comment:', error);
        }
    }

    /**
     * Cache comments for a news article
     * @param {string} newsId - News article ID
     * @param {Array} comments - Comments array from backend
     */
    static cacheComments(newsId, comments) {
        try {
            const cache = this.getCommentCache();
            cache[newsId] = {
                comments: comments,
                timestamp: Date.now(),
                lastUpdated: new Date().toISOString(),
            };

            // Keep cache size manageable (max 10 articles)
            const cacheKeys = Object.keys(cache);
            if (cacheKeys.length > 10) {
                // Remove oldest entries
                const sortedKeys = cacheKeys.sort(
                    (a, b) => cache[a].timestamp - cache[b].timestamp
                );
                sortedKeys.slice(0, -10).forEach((key) => delete cache[key]);
            }

            localStorage.setItem(this.COMMENT_CACHE_KEY, JSON.stringify(cache));
            console.log(
                `✅ Comments cached for newsId: ${newsId} (${comments.length} comments)`
            );
        } catch (error) {
            console.error('Error caching comments:', error);
        }
    }

    /**
     * Get cached comments for a news article
     * @param {string} newsId - News article ID
     * @returns {Array|null} Cached comments or null if not found/expired
     */
    static getCachedComments(newsId) {
        try {
            const cache = this.getCommentCache();
            const cached = cache[newsId];

            if (!cached) return null;

            // Check if cache is less than 5 minutes old
            const isExpired = Date.now() - cached.timestamp > 5 * 60 * 1000;
            if (isExpired) {
                delete cache[newsId];
                localStorage.setItem(
                    this.COMMENT_CACHE_KEY,
                    JSON.stringify(cache)
                );
                return null;
            }

            console.log(`📋 Using cached comments for newsId: ${newsId}`);
            return cached.comments;
        } catch (error) {
            console.error('Error getting cached comments:', error);
            return null;
        }
    }

    /**
     * Get comment cache from localStorage
     * @returns {Object} Comment cache object
     */
    static getCommentCache() {
        try {
            const stored = localStorage.getItem(this.COMMENT_CACHE_KEY);
            return stored ? JSON.parse(stored) : {};
        } catch (error) {
            console.error('Error getting comment cache:', error);
            return {};
        }
    }

    /**
     * Get user statistics
     * @returns {Object} User comment statistics
     */
    static getUserCommentStats() {
        const userComments = this.getUserComments();
        const uniqueArticles = [...new Set(userComments.map((c) => c.newsId))];

        return {
            totalComments: userComments.length,
            articlesCommentedOn: uniqueArticles.length,
            mostRecentComment:
                userComments.length > 0
                    ? userComments.sort(
                          (a, b) =>
                              new Date(b.createdAt) - new Date(a.createdAt)
                      )[0]
                    : null,
            commentsThisSession: userComments.filter(
                (c) =>
                    (Date.now() - c.metadata?.timestamp || 0) <
                    24 * 60 * 60 * 1000
            ).length,
        };
    }

    /**
     * Restore user data from backend profile after page refresh
     * This ensures userName is correctly loaded even after page refresh
     */
    static async restoreUserDataFromProfile() {
        try {
            const email = localStorage.getItem('userEmail');
            const token = localStorage.getItem('accessToken');

            if (!email || !token) {
                console.log(
                    'No email or token found, skipping user data restoration'
                );
                return false;
            }

            // Check if we already have userName - if so, skip restoration
            const existingUserName = localStorage.getItem('userName');
            if (
                existingUserName &&
                existingUserName !== 'anonymous' &&
                existingUserName !== email.split('@')[0]
            ) {
                console.log('Valid userName already exists:', existingUserName);
                return true;
            }

            console.log('Restoring user data from profile for:', email);

            const response = await fetch(
                `http://localhost:8080/users/profile?email=${encodeURIComponent(
                    email
                )}`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.ok) {
                const data = await response.json();
                console.log('Profile data restored:', data);

                // Update localStorage with actual user data
                if (data.username) {
                    localStorage.setItem('userName', data.username);
                    console.log('✅ userName restored:', data.username);

                    // Update display name in stored comments
                    this.updateStoredCommentsDisplayName(data.username);
                }

                if (data.kycVerified !== undefined) {
                    localStorage.setItem(
                        'kycVerified',
                        data.kycVerified.toString()
                    );
                }

                // Clear any cached backend user ID if email changes
                if (localStorage.getItem('userEmail') !== email) {
                    localStorage.removeItem('backendUserId');
                }

                return true;
            } else {
                console.log('Could not fetch profile data:', response.status);
                return false;
            }
        } catch (error) {
            console.log('Error restoring user data:', error.message);
            return false;
        }
    }

    /**
     * Update display name in all stored comments
     * @param {string} newDisplayName - New display name from profile
     */
    static updateStoredCommentsDisplayName(newDisplayName) {
        try {
            const userComments = this.getUserComments();
            const updatedComments = userComments.map((comment) => ({
                ...comment,
                displayName: newDisplayName,
            }));
            localStorage.setItem(
                this.USER_COMMENTS_KEY,
                JSON.stringify(updatedComments)
            );
            console.log(
                '✅ Updated display name in stored comments:',
                newDisplayName
            );
        } catch (error) {
            console.error(
                'Error updating stored comments display name:',
                error
            );
        }
    }

    /**
     * Get user ID from backend using email
     * Uses the /getIdByEmail endpoint to get the actual database user ID
     */
    static async getUserIdByEmail(email) {
        try {
            console.log('Getting user ID for email:', email);

            const response = await fetch(
                `http://localhost:8080/users/getIdByEmail?email=${encodeURIComponent(
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

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Failed to get user ID by email:', errorText);
                throw new Error(
                    `Failed to get user ID: ${response.status} - ${errorText}`
                );
            }

            const userId = await response.json();
            console.log('✅ User ID retrieved:', userId, typeof userId);

            // Cache the user ID in localStorage for faster subsequent requests
            localStorage.setItem('backendUserId', userId.toString());

            return userId;
        } catch (error) {
            console.error('Error getting user ID by email:', error);
            throw error;
        }
    }

    /**
     * Get user ID for backend operations
     * First tries cached ID, then fetches from backend if needed
     * Also ensures user data is properly restored on first call
     */
    static async getUserIdForBackend() {
        try {
            // First, ensure user data is restored from profile (for page refreshes)
            await this.restoreUserDataFromProfile();

            // Check if we have a cached user ID
            const cachedUserId = localStorage.getItem('backendUserId');
            if (cachedUserId) {
                console.log('Using cached user ID:', cachedUserId);
                return parseInt(cachedUserId);
            }

            // Get email from localStorage
            const userEmail = localStorage.getItem('userEmail');
            if (!userEmail) {
                throw new Error('User email not found. Please login again.');
            }

            // Fetch user ID from backend
            const userId = await this.getUserIdByEmail(userEmail);
            return userId;
        } catch (error) {
            console.error('Error getting user ID for backend:', error);
            throw error;
        }
    }

    /**
     * Decode JWT token to extract user information
     */
    static decodeJwtToken(token) {
        try {
            if (!token) return null;

            // JWT has three parts separated by dots
            const parts = token.split('.');
            if (parts.length !== 3) return null;

            // Decode the payload (second part)
            const payload = JSON.parse(atob(parts[1]));
            console.log('=== DETAILED JWT PAYLOAD ===');
            console.log('Raw payload:', payload);
            console.log('Available fields:', Object.keys(payload));
            console.log(
                'Field types:',
                Object.keys(payload).map(
                    (key) => `${key}: ${typeof payload[key]} = ${payload[key]}`
                )
            );
            console.log('============================');
            return payload;
        } catch (error) {
            console.error('Error decoding JWT:', error);
            return null;
        }
    }

    /**
     * Debug localStorage contents for authentication and comments
     */
    static debugAuthState() {
        console.log('=== AUTH DEBUG INFO ===');
        console.log(
            'accessToken:',
            localStorage.getItem('accessToken') ? 'Present' : 'Missing'
        );
        console.log('userEmail:', localStorage.getItem('userEmail'));
        console.log('userId:', localStorage.getItem('userId'));
        console.log('userName:', localStorage.getItem('userName'));
        console.log('backendUserId:', localStorage.getItem('backendUserId'));
        console.log('kycVerified:', localStorage.getItem('kycVerified'));

        // Debug comment storage
        const userComments = this.getUserComments();
        const commentStats = this.getUserCommentStats();
        console.log('=== COMMENT STORAGE DEBUG ===');
        console.log('Stored user comments:', userComments.length);
        console.log('Comment statistics:', commentStats);
        console.log('Recent comments:', userComments.slice(-3));
        console.log('============================');

        // Decode and show JWT contents
        const token = localStorage.getItem('accessToken');
        if (token) {
            this.decodeJwtToken(token);
        }
    }

    /**
     * Check KYC verification on frontend before making API calls
     */
    static async checkKycVerification() {
        try {
            const email = localStorage.getItem('userEmail');
            if (!email) {
                console.log('No user email found for KYC check');
                return false;
            }

            console.log('Checking KYC verification for:', email);

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

                // Update localStorage with current status
                localStorage.setItem('kycVerified', isVerified.toString());

                return isVerified;
            } else {
                console.error('Failed to check KYC status:', response.status);
                return false;
            }
        } catch (error) {
            console.error('Error checking KYC status:', error);
            return false;
        }
    }

    /**
     * Submit a new comment using the proper backend user ID
     * @param {string} userId - User ID (email) from localStorage
     * @param {string} newsId - News article ID
     * @param {string} content - Comment content
     * @returns {Promise<Object>} Comment object
     */
    static async postComment(userId, newsId, content) {
        try {
            // Debug authentication state
            this.debugAuthState();

            // Get the actual backend user ID using the getIdByEmail endpoint
            const backendUserId = await this.getUserIdForBackend();

            console.log('=== BACKEND USER ID RESOLUTION ===');
            console.log('Frontend userId (email):', userId);
            console.log(
                'User email from localStorage:',
                localStorage.getItem('userEmail')
            );
            console.log(
                'User name from localStorage:',
                localStorage.getItem('userName')
            );
            console.log(
                'Backend user ID:',
                backendUserId,
                typeof backendUserId
            );
            console.log('===================================');

            if (!backendUserId) {
                throw new Error(
                    'Could not resolve user ID. Please login again.'
                );
            }

            // Prepare request data with the correct backend user ID
            const requestData = {
                userId: backendUserId, // Use the ID from getIdByEmail endpoint
                newsId: newsId,
                content: content,
            };

            console.log('=== COMMENT POST REQUEST ===');
            console.log('URL:', `${this.baseUrl}/post`);
            console.log('Headers:', this.getAuthHeaders());
            console.log('Body:', requestData);
            console.log('Body JSON:', JSON.stringify(requestData, null, 2));
            console.log('============================');

            const response = await fetch(`${this.baseUrl}/post`, {
                method: 'POST',
                headers: this.getAuthHeaders(),
                body: JSON.stringify(requestData),
            });

            console.log('Response Status:', response.status);
            console.log(
                'Response Headers:',
                Object.fromEntries(response.headers)
            );

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Backend error response:', {
                    status: response.status,
                    statusText: response.statusText,
                    body: errorText,
                });

                // Handle specific 401 error
                if (response.status === 401) {
                    console.error(
                        'Authentication failed - clearing stored tokens'
                    );
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');
                    localStorage.removeItem('backendUserId'); // Clear cached user ID
                    throw new Error(
                        'Authentication failed. Please login again.'
                    );
                }

                // Handle 404 user not found - clear cached user ID and retry
                if (
                    response.status === 404 &&
                    errorText.includes('User not found')
                ) {
                    console.warn(
                        'User ID not found, clearing cache and retrying...'
                    );
                    localStorage.removeItem('backendUserId');
                    throw new Error('User not found. Please try again.');
                }

                throw new Error(
                    `Failed to post comment: ${response.status} - ${errorText}`
                );
            }

            const comment = await response.json();
            console.log('✅ Comment posted successfully:', comment);

            // Store the comment in localStorage for tracking
            this.storeUserComment(comment, newsId);

            // Clear cached comments for this news article to force refresh
            const cache = this.getCommentCache();
            delete cache[newsId];
            localStorage.setItem(this.COMMENT_CACHE_KEY, JSON.stringify(cache));

            return comment;
        } catch (error) {
            console.error('❌ Error posting comment:', error);
            throw error;
        }
    }

    /**
     * Get all comments for a news article with enhanced caching and user tracking
     * @param {string} newsId - News article ID
     * @param {string} orderBy - Ordering preference ('NEWEST', 'OLDEST', 'POPULAR')
     * @returns {Promise<Array>} Array of comments with user ownership info
     */
    static async getCommentsByNewsId(newsId, orderBy = 'NEWEST') {
        try {
            console.log(
                `Fetching comments for newsId: ${newsId}, orderBy: ${orderBy}`
            );

            // Try to get cached comments first
            const cachedComments = this.getCachedComments(newsId);
            if (cachedComments && Array.isArray(cachedComments)) {
                console.log(
                    '📋 Returning cached comments:',
                    cachedComments.length
                );
                return this.enrichCommentsWithOwnership(cachedComments);
            }

            const response = await fetch(
                `${this.baseUrl}/getAllByNews?newsId=${encodeURIComponent(
                    newsId
                )}&orderBy=${orderBy}`,
                {
                    method: 'GET',
                    headers: this.getAuthHeaders(),
                }
            );

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Failed to fetch comments:', errorText);

                // Handle 401 for comments fetch
                if (response.status === 401) {
                    console.log(
                        'Authentication required for fetching comments'
                    );
                    return []; // Return empty array instead of throwing error
                }

                throw new Error(
                    `Failed to fetch comments: ${response.status} - ${errorText}`
                );
            }

            const comments = await response.json();
            console.log('Comments fetched successfully:', comments);

            const commentsArray = comments || [];

            // Cache the comments
            this.cacheComments(newsId, commentsArray);

            // Enrich comments with ownership information
            return this.enrichCommentsWithOwnership(commentsArray);
        } catch (error) {
            console.error('Error fetching comments:', error);
            // Return empty array on error to prevent UI crashes
            return [];
        }
    }

    /**
     * Enrich comments with user ownership and display information
     * @param {Array} comments - Comments array from backend
     * @returns {Array} Enhanced comments with ownership info
     */
    static enrichCommentsWithOwnership(comments) {
        const userEmail = localStorage.getItem('userEmail');
        const userName = localStorage.getItem('userName');
        const userComments = this.getUserComments();

        return comments.map((comment) => {
            const isOwned = this.isUserComment(comment.id || comment.commentId);
            const storedComment = userComments.find(
                (uc) => uc.commentId === (comment.id || comment.commentId)
            );

            return {
                ...comment,
                // Add ownership flags
                isOwnedByCurrentUser: isOwned,
                canEdit: isOwned,
                canDelete: isOwned,
                // Enhanced display information
                displayName:
                    comment.userDto?.name ||
                    comment.userName ||
                    (isOwned ? userName || 'You' : 'Anonymous User'),
                // Add stored metadata if available
                metadata: storedComment?.metadata || null,
                // Add timestamp formatting
                formattedTime: CommentUtils.formatCommentTime(
                    comment.createdAt || comment.timestamp
                ),
            };
        });
    }

    /**
     * Delete a comment with localStorage cleanup
     * @param {string} commentId - Comment ID to delete
     * @returns {Promise<boolean>} Success status
     */
    static async deleteComment(commentId) {
        try {
            console.log(`Deleting comment with ID: ${commentId}`);

            const response = await fetch(
                `${this.baseUrl}/delete/${commentId}`,
                {
                    method: 'DELETE',
                    headers: this.getAuthHeaders(),
                }
            );

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Failed to delete comment:', errorText);

                if (response.status === 401) {
                    throw new Error(
                        'Authentication failed. Please login again.'
                    );
                }

                throw new Error(
                    `Failed to delete comment: ${response.status} - ${errorText}`
                );
            }

            console.log('Comment deleted successfully');

            // Remove from localStorage
            this.removeUserComment(commentId);

            // Clear comment cache to force refresh
            const cache = this.getCommentCache();
            Object.keys(cache).forEach((newsId) => {
                delete cache[newsId];
            });
            localStorage.setItem(this.COMMENT_CACHE_KEY, JSON.stringify(cache));

            return true;
        } catch (error) {
            console.error('Error deleting comment:', error);
            throw error;
        }
    }

    /**
     * Clean up old data from localStorage
     */
    static cleanupOldData() {
        try {
            const userComments = this.getUserComments();
            const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;

            // Remove comments older than 30 days
            const recentComments = userComments.filter(
                (comment) => (comment.metadata?.timestamp || 0) > thirtyDaysAgo
            );

            if (recentComments.length !== userComments.length) {
                localStorage.setItem(
                    this.USER_COMMENTS_KEY,
                    JSON.stringify(recentComments)
                );
                console.log(
                    `🧹 Cleaned up ${
                        userComments.length - recentComments.length
                    } old comments`
                );
            }

            // Clean up old comment cache
            const cache = this.getCommentCache();
            const validCache = {};
            Object.keys(cache).forEach((newsId) => {
                if (
                    Date.now() - cache[newsId].timestamp <
                    24 * 60 * 60 * 1000
                ) {
                    validCache[newsId] = cache[newsId];
                }
            });
            localStorage.setItem(
                this.COMMENT_CACHE_KEY,
                JSON.stringify(validCache)
            );
        } catch (error) {
            console.error('Error cleaning up old data:', error);
        }
    }
}

// Comment Utilities (enhanced)
export class CommentUtils {
    /**
     * Get user ID from localStorage
     */
    static getUserId() {
        return (
            localStorage.getItem('userEmail') ||
            localStorage.getItem('userId') ||
            null
        );
    }

    /**
     * Check if user is logged in
     */
    static isLoggedIn() {
        const hasToken = !!localStorage.getItem('accessToken');
        const hasEmail = !!localStorage.getItem('userEmail');
        console.log('Login status check:', {
            hasToken,
            hasEmail,
            isLoggedIn: hasToken && hasEmail,
        });
        return hasToken && hasEmail;
    }

    /**
     * Format comment timestamp for display
     * @param {string|Date} timestamp - Comment timestamp
     * @returns {string} Formatted time string
     */
    static formatCommentTime(timestamp) {
        if (!timestamp) return 'Unknown time';

        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;

        return date.toLocaleDateString();
    }

    /**
     * Validate comment content
     * @param {string} content - Comment content to validate
     * @returns {Object} Validation result
     */
    static validateComment(content) {
        if (!content || content.trim().length === 0) {
            return {
                isValid: false,
                error: 'Comment cannot be empty',
            };
        }

        if (content.trim().length < 3) {
            return {
                isValid: false,
                error: 'Comment must be at least 3 characters long',
            };
        }

        if (content.length > 1000) {
            return {
                isValid: false,
                error: 'Comment cannot exceed 1000 characters',
            };
        }

        return {
            isValid: true,
            error: null,
        };
    }

    /**
     * Sort comments by different criteria
     * @param {Array} comments - Array of comments
     * @param {string} sortBy - Sort criteria ('newest', 'oldest', 'popular')
     * @returns {Array} Sorted comments
     */
    static sortComments(comments, sortBy = 'newest') {
        if (!Array.isArray(comments)) {
            console.warn('sortComments received non-array input:', comments);
            return [];
        }

        const sorted = [...comments];

        switch (sortBy.toLowerCase()) {
            case 'newest':
                return sorted.sort(
                    (a, b) =>
                        new Date(b.createdAt || b.timestamp || 0) -
                        new Date(a.createdAt || a.timestamp || 0)
                );
            case 'oldest':
                return sorted.sort(
                    (a, b) =>
                        new Date(a.createdAt || a.timestamp || 0) -
                        new Date(b.createdAt || b.timestamp || 0)
                );
            case 'popular':
                return sorted.sort((a, b) => {
                    const aLikes = a.likes || a.upvotes || 0;
                    const bLikes = b.likes || b.upvotes || 0;
                    if (aLikes === bLikes) {
                        return (
                            new Date(b.createdAt || b.timestamp || 0) -
                            new Date(a.createdAt || a.timestamp || 0)
                        );
                    }
                    return bLikes - aLikes;
                });
            default:
                return sorted;
        }
    }

    /**
     * Check if user can perform comment actions (requires KYC verification)
     * This now does a frontend check against the backend KYC API
     * @param {string} action - Action type ('comment', 'delete')
     * @returns {Promise<boolean>} Can perform action
     */
    static async canPerformAction(action = 'comment') {
        try {
            // First check if user is logged in
            if (!this.isLoggedIn()) {
                console.log(`Cannot ${action}: User not logged in`);
                alert('Please login to perform this action.');
                return false;
            }

            // Debug auth state before KYC check
            CommentService.debugAuthState();

            // Do live KYC verification check against backend
            console.log(
                `Performing live KYC verification check for ${action} action`
            );
            const isKycVerified = await CommentService.checkKycVerification();

            if (!isKycVerified) {
                console.log(`Cannot ${action}: User not KYC verified`);
                alert(
                    'KYC verification is required to comment on articles. Please complete your profile verification first.'
                );
                return false;
            }

            console.log(`User can perform ${action}: KYC verified`);
            return true;
        } catch (error) {
            console.error(`Error checking if user can ${action}:`, error);
            alert('Error verifying your account. Please try again.');
            return false;
        }
    }

    /**
     * Get display name for a comment author
     * @param {Object} comment - Comment object
     * @returns {string} Display name
     */
    static getAuthorDisplayName(comment) {
        if (comment.displayName) return comment.displayName;
        if (comment.userName) return comment.userName;
        if (comment.author) return comment.author;
        if (comment.user && comment.user.userName) return comment.user.userName;
        if (comment.userDto && comment.userDto.userName)
            return comment.userDto.userName;
        return 'Anonymous User';
    }

    /**
     * Check if current user owns a comment (enhanced)
     * @param {Object} comment - Comment object
     * @returns {boolean} Is owner
     */
    static isCommentOwner(comment) {
        // Check the enhanced ownership flag first
        if (comment.isOwnedByCurrentUser !== undefined) {
            return comment.isOwnedByCurrentUser;
        }

        // Fallback to traditional checks
        const currentUserEmail = localStorage.getItem('userEmail');
        const currentUserId = this.getUserId();

        if (!currentUserEmail && !currentUserId) return false;

        return (
            comment.userId === currentUserId ||
            comment.userId === currentUserEmail ||
            comment.userEmail === currentUserEmail ||
            (comment.user &&
                (comment.user.email === currentUserEmail ||
                    comment.user.id === currentUserId ||
                    comment.user.userId === currentUserEmail)) ||
            (comment.userDto &&
                (comment.userDto.email === currentUserEmail ||
                    comment.userDto.userId === currentUserEmail))
        );
    }

    /**
     * Get user's comment history summary
     * @returns {Object} Comment history summary
     */
    static getUserCommentHistory() {
        return CommentService.getUserCommentStats();
    }
}

// Initialize cleanup on load
if (typeof window !== 'undefined') {
    // Run cleanup when service is loaded
    CommentService.cleanupOldData();

    // Generate session ID for this browser session
    if (!sessionStorage.getItem('sessionId')) {
        sessionStorage.setItem(
            'sessionId',
            Date.now().toString(36) + Math.random().toString(36).substr(2)
        );
    }
}

// Export default
export default {
    CommentService,
    CommentUtils,
};
