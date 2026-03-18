// API base URL - using the same as the existing news service
const API_BASE_URL = 'http://localhost:8080';

// Vote service for handling article quality ratings
export class VoteService {
    /**
     * Submit a vote for a specific metric on a news article
     * @param {string} userId - User ID
     * @param {string} newsId - News article ID
     * @param {string} metric - Metric type (depthOfReporting, politicalBiasness, credibility, relevance)
     * @param {number} value - Vote value (1 for upvote, -1 for downvote)
     * @returns {Promise<Object>} Vote response
     */
    static async submitVote(userId, newsId, metric, value) {
        try {
            const response = await fetch(`${API_BASE_URL}/votes/vote`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId,
                    newsId,
                    metric,
                    value,
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Failed to submit vote:', error);
            throw error;
        }
    }

    /**
     * Check if user has voted for a specific metric on a news article
     * @param {string} userId - User ID
     * @param {string} newsId - News article ID
     * @param {string} metric - Metric type
     * @returns {Promise<Object>} Vote check response {voted: boolean, value: number|null}
     */
    static async checkUserVote(userId, newsId, metric) {
        try {
            const params = new URLSearchParams({
                userId,
                newsId,
                metric,
            });

            const response = await fetch(
                `${API_BASE_URL}/votes/check?${params}`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Failed to check vote:', error);
            throw error;
        }
    }

    /**
     * Get all user votes for a news article
     * @param {string} userId - User ID
     * @param {string} newsId - News article ID
     * @returns {Promise<Object>} All user votes for the article
     */
    static async getUserVotesForArticle(userId, newsId) {
        const metrics = [
            'depthOfReporting',
            'politicalBiasness',
            'credibility',
            'relevance',
        ];
        const votes = {};

        try {
            const promises = metrics.map((metric) =>
                this.checkUserVote(userId, newsId, metric)
            );

            const results = await Promise.all(promises);

            metrics.forEach((metric, index) => {
                const result = results[index];
                votes[metric] = result.voted ? result.value : null;
            });

            return votes;
        } catch (error) {
            console.error('Failed to get user votes:', error);
            // Return default state if API fails
            return metrics.reduce((acc, metric) => {
                acc[metric] = null;
                return acc;
            }, {});
        }
    }
}

// Utility functions for handling vote data
export const VoteUtils = {
    /**
     * Convert vote value to vote type
     * @param {number} value - Vote value (1 or -1)
     * @returns {string} Vote type ('upvote' or 'downvote')
     */
    valueToVoteType(value) {
        return value === 1 ? 'upvote' : 'downvote';
    },

    /**
     * Convert vote type to value
     * @param {string} voteType - Vote type ('upvote' or 'downvote')
     * @returns {number} Vote value (1 or -1)
     */
    voteTypeToValue(voteType) {
        return voteType === 'upvote' ? 1 : -1;
    },

    /**
     * Generate a temporary user ID if not logged in
     * @returns {string} Temporary user ID
     */
    getTempUserId() {
        let tempUserId = localStorage.getItem('tempUserId');
        if (!tempUserId) {
            tempUserId = `temp_${Date.now()}_${Math.random()
                .toString(36)
                .substr(2, 9)}`;
            localStorage.setItem('tempUserId', tempUserId);
        }
        return tempUserId;
    },

    /**
     * Get user ID from session or create temporary one
     * @returns {string} User ID
     */
    getUserId() {
        // First try to get from actual user session/auth
        const authUserId =
            localStorage.getItem('userId') || sessionStorage.getItem('userId');
        if (authUserId) {
            return authUserId;
        }

        // Fall back to temporary ID
        return this.getTempUserId();
    },
};

export default VoteService;
