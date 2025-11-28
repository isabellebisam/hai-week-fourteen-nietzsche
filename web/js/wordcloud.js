/**
 * Word Cloud Module
 * Generates word clouds using d3-cloud
 */

const WordCloud = (function() {
    let currentCloud = null;

    /**
     * Generate a word cloud from bag-of-words data
     * @param {Array} wordData - Array of {word, count} objects
     * @param {string} canvasId - ID of the canvas element
     * @param {number} width - Width of the canvas
     * @param {number} height - Height of the canvas
     */
    function generate(wordData, canvasId = 'wordcloud-canvas', width = 800, height = 500) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) {
            console.error('Canvas element not found:', canvasId);
            return;
        }

        // Set canvas dimensions
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        // Prepare data for d3-cloud
        const maxCount = Math.max(...wordData.map(w => w.count));
        const minCount = Math.min(...wordData.map(w => w.count));

        // Calculate font sizes (scale from 12px to 60px)
        const words = wordData.map(w => ({
            text: w.word,
            size: 12 + ((w.count - minCount) / (maxCount - minCount)) * 48
        }));

        // Create word cloud layout
        const layout = d3.layout.cloud()
            .size([width, height])
            .words(words)
            .padding(5)
            .rotate(() => 0) // No rotation for cleaner look
            .font('Georgia, serif')
            .fontSize(d => d.size)
            .on('end', draw);

        layout.start();

        function draw(words) {
            // Clear canvas
            ctx.clearRect(0, 0, width, height);

            // Center the word cloud
            ctx.save();
            ctx.translate(width / 2, height / 2);

            words.forEach(word => {
                ctx.save();
                ctx.translate(word.x, word.y);
                ctx.rotate(word.rotate * Math.PI / 180);

                // Calculate grayscale based on size (darker for larger words)
                const intensity = Math.floor(40 + (1 - word.size / 60) * 120);
                ctx.fillStyle = `rgb(${intensity}, ${intensity}, ${intensity})`;

                ctx.font = `${word.size}px ${word.font}`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(word.text, 0, 0);

                ctx.restore();
            });

            ctx.restore();
        }

        currentCloud = layout;
    }

    /**
     * Generate word cloud for a specific text
     * @param {Object} textData - Text analysis data
     * @param {string} canvasId - Canvas element ID
     */
    function generateForText(textData, canvasId = 'wordcloud-canvas') {
        const container = document.querySelector('.wordcloud-container');
        if (container) {
            const width = Math.min(container.clientWidth - 40, 800);
            const height = 500;
            generate(textData.bag_of_words.top_100, canvasId, width, height);
        } else {
            generate(textData.bag_of_words.top_100, canvasId);
        }
    }

    /**
     * Generate side-by-side word clouds for comparison
     * @param {Array} textsData - Array of text data objects
     * @param {Array} canvasIds - Array of canvas IDs
     */
    function generateComparison(textsData, canvasIds) {
        textsData.forEach((textData, index) => {
            if (index < canvasIds.length) {
                generate(
                    textData.bag_of_words.top_100,
                    canvasIds[index],
                    400,
                    350
                );
            }
        });
    }

    /**
     * Clear the current word cloud
     * @param {string} canvasId - Canvas element ID
     */
    function clear(canvasId = 'wordcloud-canvas') {
        const canvas = document.getElementById(canvasId);
        if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    }

    // Public API
    return {
        generate,
        generateForText,
        generateComparison,
        clear
    };
})();
