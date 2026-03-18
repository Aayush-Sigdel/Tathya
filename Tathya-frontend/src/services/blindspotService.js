const API_BASE_URL = 'http://localhost:8080';

export const BlindspotService = {
    // Get all blindspots using your API
    getAllBlindSpots: async (count = 100) => {
        try {
            const response = await fetch(
                `${API_BASE_URL}/newsGroup/getAllBlindSpots?count=${count}`
            );
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            console.log('Blindspot API response:', data);
            return data;
        } catch (error) {
            console.error('Error fetching blindspots:', error);
            throw error;
        }
    },

    // Get single blindspot by ID - FIX: Compare as strings, not integers
    getBlindspotById: async (id) => {
        try {
            const blindspots = await BlindspotService.getAllBlindSpots();
            // Convert both to string for comparison since your API returns string IDs
            const foundBlindspot = blindspots.find(
                (spot) => spot.id === id || spot.id === id.toString()
            );
            console.log('Searching for ID:', id, 'Found:', foundBlindspot);
            return foundBlindspot;
        } catch (error) {
            console.error('Error fetching blindspot by ID:', error);
            throw error;
        }
    },

    // Transform News object to NewsGroup format for MainNews
    transformNewsToNewsGroup: (newsItem) => {
        if (!newsItem) return null;

        // Create a NewsGroup-like structure from a single News item
        return {
            groupId: newsItem.id?.toString(),
            news: [newsItem], // Wrap the single news item in an array
            sources: newsItem.newsPortal ? [newsItem.newsPortal] : [],
            category: newsItem.category,
            publishedDate: newsItem.postedAt,
            // Add any other fields that MainNews might expect
            summary: newsItem.summary || newsItem.description,
            lead: newsItem.lead,
            title: newsItem.title,
        };
    },
};
