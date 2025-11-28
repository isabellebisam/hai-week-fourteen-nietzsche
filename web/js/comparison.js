/**
 * Comparison Module
 * Handles multi-text comparison features
 */

const Comparison = (function() {

    /**
     * Display comparison for multiple texts
     * @param {Array} textsData - Array of text data objects
     * @param {Object} comparativeData - Comparative analysis data
     */
    async function display(textsData, comparativeData) {
        const container = document.getElementById('comparison-content');
        if (!container) return;

        // Build comparison HTML
        container.innerHTML = `
            <div class="comparison-section">
                <h5>Overview</h5>
                ${renderOverview(textsData)}
            </div>

            <div class="comparison-section">
                <h5>Word Clouds</h5>
                ${renderWordClouds(textsData)}
            </div>

            <div class="comparison-section">
                <h5>Sentiment Comparison</h5>
                <canvas id="comparison-sentiment-chart"></canvas>
            </div>

            <div class="comparison-section">
                <h5>Style Metrics Comparison</h5>
                ${renderStyleComparison(textsData)}
            </div>

            <div class="comparison-section">
                <h5>Vocabulary Overlap</h5>
                ${await renderVocabularyOverlap(textsData, comparativeData)}
            </div>

            <div class="comparison-section">
                <h5>Key Concepts</h5>
                <div id="concepts-comparison"></div>
            </div>
        `;

        // Generate visualizations
        setTimeout(() => {
            renderWordCloudVisuals(textsData);
            Sentiment.displayComparison(textsData, 'comparison-sentiment-chart');
            NGrams.displayConceptComparison(textsData);
        }, 100);
    }

    /**
     * Render overview table
     */
    function renderOverview(textsData) {
        return `
            <table class="table table-hover">
                <thead>
                    <tr>
                        <th>Text</th>
                        <th class="text-end">Words</th>
                        <th class="text-end">Unique Words</th>
                        <th class="text-end">TTR</th>
                        <th class="text-end">Sentiment</th>
                    </tr>
                </thead>
                <tbody>
                    ${textsData.map(text => `
                        <tr>
                            <td><strong>${text.title}</strong></td>
                            <td class="text-end">${text.word_count.toLocaleString()}</td>
                            <td class="text-end">${text.unique_words.toLocaleString()}</td>
                            <td class="text-end">${text.style_metrics.vocabulary.type_token_ratio.toFixed(4)}</td>
                            <td class="text-end">${text.sentiment.vader.compound.toFixed(4)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }

    /**
     * Render word cloud containers
     */
    function renderWordClouds(textsData) {
        return `
            <div class="comparison-wordclouds">
                ${textsData.map((text, i) => `
                    <div class="wordcloud-comparison-item">
                        <h6>${text.title}</h6>
                        <canvas id="comparison-wordcloud-${i}" width="400" height="350"></canvas>
                    </div>
                `).join('')}
            </div>
        `;
    }

    /**
     * Generate word cloud visuals
     */
    function renderWordCloudVisuals(textsData) {
        const canvasIds = textsData.map((_, i) => `comparison-wordcloud-${i}`);
        WordCloud.generateComparison(textsData, canvasIds);
    }

    /**
     * Render style metrics comparison table
     */
    function renderStyleComparison(textsData) {
        const metrics = [
            { key: 'avg_sentence_length', label: 'Avg Sentence Length', path: 'style_metrics.sentences.avg_length', unit: ' words' },
            { key: 'flesch_reading_ease', label: 'Reading Ease', path: 'style_metrics.readability.flesch_reading_ease', unit: '' },
            { key: 'flesch_kincaid', label: 'Grade Level', path: 'style_metrics.readability.flesch_kincaid_grade', unit: '' },
            { key: 'avg_word_length', label: 'Avg Word Length', path: 'style_metrics.word_length.average', unit: ' chars' },
            { key: 'punct_density', label: 'Punctuation Density', path: 'style_metrics.punctuation.density_per_1000', unit: '/1000' }
        ];

        return `
            <table class="table table-sm table-hover">
                <thead>
                    <tr>
                        <th>Metric</th>
                        ${textsData.map(t => `<th class="text-center">${t.title.length > 20 ? t.title.substring(0, 20) + '...' : t.title}</th>`).join('')}
                        <th class="text-center">Diff</th>
                    </tr>
                </thead>
                <tbody>
                    ${metrics.map(metric => {
                        const values = textsData.map(text => getNestedValue(text, metric.path));
                        const min = Math.min(...values);
                        const max = Math.max(...values);
                        const range = max - min;

                        return `
                            <tr>
                                <td><strong>${metric.label}</strong></td>
                                ${values.map(val => {
                                    const diff = val - min;
                                    const className = val === max ? 'bg-success bg-opacity-10' :
                                                     val === min ? 'bg-primary bg-opacity-10' : '';
                                    return `<td class="text-center ${className}">${val.toFixed(2)}${metric.unit}</td>`;
                                }).join('')}
                                <td class="text-center text-muted">${range.toFixed(2)}</td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
            <p class="small text-muted mt-2">
                <span class="bg-success bg-opacity-10 px-2">Highest value</span>
                <span class="bg-primary bg-opacity-10 px-2 ms-2">Lowest value</span>
            </p>
        `;
    }

    /**
     * Render vocabulary overlap section
     */
    async function renderVocabularyOverlap(textsData, comparativeData) {
        if (textsData.length !== 2) {
            // For more than 2 texts, show similarity matrix
            return renderSimilarityMatrix(textsData, comparativeData);
        }

        // For 2 texts, show detailed overlap
        const overlap = await DataLoader.getVocabularyOverlap(textsData[0].id, textsData[1].id);

        if (!overlap) {
            return '<p class="text-muted">Vocabulary overlap data not available.</p>';
        }

        return `
            <div class="row">
                <div class="col-md-6">
                    <div class="card">
                        <div class="card-body text-center">
                            <h3 class="display-4">${(overlap.jaccard_similarity * 100).toFixed(1)}%</h3>
                            <p class="text-muted">Jaccard Similarity</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-6">
                    <table class="table table-sm">
                        <tbody>
                            <tr>
                                <td>Shared Vocabulary</td>
                                <td class="text-end"><strong>${overlap.shared_words.toLocaleString()}</strong> words</td>
                            </tr>
                            <tr>
                                <td>Unique to ${textsData[0].title}</td>
                                <td class="text-end"><strong>${overlap.unique_to_text1.toLocaleString()}</strong> words</td>
                            </tr>
                            <tr>
                                <td>Unique to ${textsData[1].title}</td>
                                <td class="text-end"><strong>${overlap.unique_to_text2.toLocaleString()}</strong> words</td>
                            </tr>
                            <tr>
                                <td>Overlap % (${textsData[0].title})</td>
                                <td class="text-end"><strong>${overlap.overlap_percentage_text1.toFixed(1)}%</strong></td>
                            </tr>
                            <tr>
                                <td>Overlap % (${textsData[1].title})</td>
                                <td class="text-end"><strong>${overlap.overlap_percentage_text2.toFixed(1)}%</strong></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    /**
     * Render similarity matrix for multiple texts
     */
    function renderSimilarityMatrix(textsData, comparativeData) {
        const matrix = comparativeData.vocabulary_overlap.similarity_matrix;

        let html = `
            <table class="table table-sm table-bordered text-center">
                <thead>
                    <tr>
                        <th></th>
                        ${textsData.map(t => `<th class="small">${t.title.substring(0, 15)}...</th>`).join('')}
                    </tr>
                </thead>
                <tbody>
        `;

        textsData.forEach(text1 => {
            html += `<tr><th class="small">${text1.title.substring(0, 15)}...</th>`;

            textsData.forEach(text2 => {
                const similarity = matrix[text1.id][text2.id];
                const percentage = (similarity * 100).toFixed(0);
                const colorIntensity = Math.floor(similarity * 200);
                const bgColor = text1.id === text2.id
                    ? 'background-color: #e9ecef'
                    : `background-color: rgb(${200 - colorIntensity}, ${200 - colorIntensity}, 255)`;

                html += `<td style="${bgColor}">${percentage}%</td>`;
            });

            html += '</tr>';
        });

        html += '</tbody></table>';
        html += '<p class="small text-muted">Values represent Jaccard similarity coefficient (0-100%)</p>';

        return html;
    }

    /**
     * Get nested object value by path
     */
    function getNestedValue(obj, path) {
        return path.split('.').reduce((current, key) => current?.[key], obj);
    }

    /**
     * Clear comparison view
     */
    function clear() {
        const container = document.getElementById('comparison-content');
        if (container) {
            container.innerHTML = '';
        }
    }

    // Public API
    return {
        display,
        clear
    };
})();
