/**
 * Data Loader Module
 * Handles fetching and caching of analysis data
 */

const DataLoader = (function() {
    let analysisData = null;
    let isLoading = false;

    /**
     * Fetch and parse the analysis JSON file
     * @returns {Promise<Object>} The parsed analysis data
     */
    async function loadData() {
        if (analysisData) {
            return analysisData;
        }

        if (isLoading) {
            // Wait for existing load to complete
            while (isLoading) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
            return analysisData;
        }

        isLoading = true;

        try {
            const response = await fetch('data/nietzsche_analysis.json');

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            analysisData = await response.json();
            console.log('Analysis data loaded successfully:', analysisData.metadata);

            isLoading = false;
            return analysisData;

        } catch (error) {
            isLoading = false;
            console.error('Error loading analysis data:', error);
            throw error;
        }
    }

    /**
     * Get a specific text by ID
     * @param {string} textId - The text identifier
     * @returns {Promise<Object>} The text data
     */
    async function getTextById(textId) {
        const data = await loadData();
        return data.texts.find(t => t.id === textId);
    }

    /**
     * Get all texts
     * @returns {Promise<Array>} Array of all text data
     */
    async function getAllTexts() {
        const data = await loadData();
        return data.texts;
    }

    /**
     * Get comparative data
     * @returns {Promise<Object>} Comparative analysis data
     */
    async function getComparativeData() {
        const data = await loadData();
        return data.comparative;
    }

    /**
     * Get vocabulary overlap for two texts
     * @param {string} text1Id - First text ID
     * @param {string} text2Id - Second text ID
     * @returns {Promise<Object>} Overlap data
     */
    async function getVocabularyOverlap(text1Id, text2Id) {
        const data = await loadData();
        const pair = data.comparative.vocabulary_overlap.pairs.find(p =>
            (p.text1 === text1Id && p.text2 === text2Id) ||
            (p.text1 === text2Id && p.text2 === text1Id)
        );
        return pair;
    }

    /**
     * Clear cached data (useful for development/testing)
     */
    function clearCache() {
        analysisData = null;
        console.log('Data cache cleared');
    }

    // Public API
    return {
        loadData,
        getTextById,
        getAllTexts,
        getComparativeData,
        getVocabularyOverlap,
        clearCache
    };
})();

