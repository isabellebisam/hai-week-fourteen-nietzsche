/**
 * Sentiment Analysis Module
 * Visualizes sentiment data using Chart.js
 */

const Sentiment = (function() {
    let currentChart = null;

    /**
     * Display sentiment analysis for a text
     * @param {Object} textData - Text analysis data
     */
    function display(textData) {
        displayChart(textData);
        displayDetails(textData);
    }

    /**
     * Create sentiment bar chart
     * @param {Object} textData - Text analysis data
     */
    function displayChart(textData) {
        const canvas = document.getElementById('sentiment-chart');
        if (!canvas) return;

        // Destroy existing chart
        if (currentChart) {
            currentChart.destroy();
        }

        const ctx = canvas.getContext('2d');
        const sentiment = textData.sentiment.vader;

        currentChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Positive', 'Negative', 'Neutral', 'Compound'],
                datasets: [{
                    label: 'Sentiment Scores',
                    data: [
                        sentiment.positive,
                        sentiment.negative,
                        sentiment.neutral,
                        sentiment.compound
                    ],
                    backgroundColor: [
                        'rgba(25, 135, 84, 0.7)',   // Green for positive
                        'rgba(220, 53, 69, 0.7)',   // Red for negative
                        'rgba(108, 117, 125, 0.7)', // Gray for neutral
                        'rgba(13, 110, 253, 0.7)'   // Blue for compound
                    ],
                    borderColor: [
                        'rgb(25, 135, 84)',
                        'rgb(220, 53, 69)',
                        'rgb(108, 117, 125)',
                        'rgb(13, 110, 253)'
                    ],
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 1.0,
                        ticks: {
                            font: {
                                size: 12
                            }
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        }
                    },
                    x: {
                        ticks: {
                            font: {
                                size: 12,
                                weight: 'bold'
                            }
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        padding: 12,
                        titleFont: {
                            size: 14,
                            weight: 'bold'
                        },
                        bodyFont: {
                            size: 13
                        },
                        callbacks: {
                            label: function(context) {
                                return 'Score: ' + context.parsed.y.toFixed(4);
                            }
                        }
                    }
                }
            }
        });
    }

    /**
     * Display detailed sentiment metrics
     * @param {Object} textData - Text analysis data
     */
    function displayDetails(textData) {
        const detailsContainer = document.getElementById('sentiment-details');
        if (!detailsContainer) return;

        const sentiment = textData.sentiment.vader;

        detailsContainer.innerHTML = `
            <div class="metric">
                <div class="metric-label">Compound Score</div>
                <div class="metric-value">${sentiment.compound.toFixed(4)}</div>
                <p class="small text-muted mt-2">
                    Overall sentiment ranging from -1 (most negative) to +1 (most positive).
                </p>
            </div>
            <div class="metric">
                <div class="metric-label">Interpretation</div>
                <div class="mt-2">
                    ${interpretSentiment(sentiment.compound)}
                </div>
            </div>
            <div class="mt-3">
                <h6>Component Scores</h6>
                <table class="table table-sm">
                    <tbody>
                        <tr>
                            <td>Positive</td>
                            <td class="text-end"><strong>${(sentiment.positive * 100).toFixed(2)}%</strong></td>
                        </tr>
                        <tr>
                            <td>Negative</td>
                            <td class="text-end"><strong>${(sentiment.negative * 100).toFixed(2)}%</strong></td>
                        </tr>
                        <tr>
                            <td>Neutral</td>
                            <td class="text-end"><strong>${(sentiment.neutral * 100).toFixed(2)}%</strong></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        `;
    }

    /**
     * Interpret compound sentiment score
     * @param {number} compound - Compound sentiment score
     * @returns {string} Interpretation HTML
     */
    function interpretSentiment(compound) {
        let interpretation, color;

        if (compound >= 0.75) {
            interpretation = 'Very Positive';
            color = 'success';
        } else if (compound >= 0.5) {
            interpretation = 'Positive';
            color = 'success';
        } else if (compound >= 0.25) {
            interpretation = 'Moderately Positive';
            color = 'info';
        } else if (compound >= -0.25) {
            interpretation = 'Neutral';
            color = 'secondary';
        } else if (compound >= -0.5) {
            interpretation = 'Moderately Negative';
            color = 'warning';
        } else if (compound >= -0.75) {
            interpretation = 'Negative';
            color = 'danger';
        } else {
            interpretation = 'Very Negative';
            color = 'danger';
        }

        return `<span class="badge bg-${color} fs-6">${interpretation}</span>`;
    }

    /**
     * Create comparison chart for multiple texts
     * @param {Array} textsData - Array of text data objects
     * @param {string} canvasId - Canvas element ID
     */
    function displayComparison(textsData, canvasId = 'comparison-sentiment-chart') {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;

        const ctx = canvas.getContext('2d');

        const labels = textsData.map(t => t.title.length > 25 ? t.title.substring(0, 25) + '...' : t.title);
        const compounds = textsData.map(t => t.sentiment.vader.compound);
        const positives = textsData.map(t => t.sentiment.vader.positive);
        const negatives = textsData.map(t => t.sentiment.vader.negative);

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Compound',
                        data: compounds,
                        backgroundColor: 'rgba(13, 110, 253, 0.7)',
                        borderColor: 'rgb(13, 110, 253)',
                        borderWidth: 2
                    },
                    {
                        label: 'Positive',
                        data: positives,
                        backgroundColor: 'rgba(25, 135, 84, 0.7)',
                        borderColor: 'rgb(25, 135, 84)',
                        borderWidth: 2
                    },
                    {
                        label: 'Negative',
                        data: negatives,
                        backgroundColor: 'rgba(220, 53, 69, 0.7)',
                        borderColor: 'rgb(220, 53, 69)',
                        borderWidth: 2
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 1.0
                    }
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    }
                }
            }
        });
    }

    /**
     * Clear sentiment visualizations
     */
    function clear() {
        if (currentChart) {
            currentChart.destroy();
            currentChart = null;
        }

        const detailsContainer = document.getElementById('sentiment-details');
        if (detailsContainer) {
            detailsContainer.innerHTML = '';
        }
    }

    // Public API
    return {
        display,
        displayComparison,
        clear
    };
})();
