/**
 * Style Metrics Module
 * Displays stylistic analysis data
 */

const StyleMetrics = (function() {

    /**
     * Display all style metrics for a text
     * @param {Object} textData - Text analysis data
     */
    function display(textData) {
        const container = document.getElementById('style-metrics-content');
        if (!container) return;

        const metrics = textData.style_metrics;

        container.innerHTML = `
            ${renderMetricCards(metrics)}
            ${renderSentenceMetrics(metrics.sentences)}
            ${renderVocabularyMetrics(metrics.vocabulary)}
            ${renderReadabilityMetrics(metrics.readability)}
            ${renderWordLengthMetrics(metrics.word_length)}
            ${renderPunctuationMetrics(metrics.punctuation)}
        `;
    }

    /**
     * Render quick metric cards
     */
    function renderMetricCards(metrics) {
        return `
            <div class="metric-grid">
                <div class="metric-card">
                    <h6>Average Sentence Length</h6>
                    <div class="value">${metrics.sentences.avg_length} words</div>
                </div>
                <div class="metric-card">
                    <h6>Type-Token Ratio</h6>
                    <div class="value">${metrics.vocabulary.type_token_ratio.toFixed(4)}</div>
                </div>
                <div class="metric-card">
                    <h6>Reading Ease</h6>
                    <div class="value">${metrics.readability.flesch_reading_ease.toFixed(1)}</div>
                </div>
                <div class="metric-card">
                    <h6>Grade Level</h6>
                    <div class="value">${metrics.readability.flesch_kincaid_grade.toFixed(1)}</div>
                </div>
            </div>
        `;
    }

    /**
     * Render sentence statistics
     */
    function renderSentenceMetrics(sentences) {
        return `
            <div class="mt-4">
                <h5>Sentence Statistics</h5>
                <div class="row">
                    <div class="col-md-6">
                        <table class="table table-sm">
                            <tbody>
                                <tr>
                                    <td>Total Sentences</td>
                                    <td class="text-end"><strong>${sentences.count.toLocaleString()}</strong></td>
                                </tr>
                                <tr>
                                    <td>Average Length</td>
                                    <td class="text-end"><strong>${sentences.avg_length} words</strong></td>
                                </tr>
                                <tr>
                                    <td>Median Length</td>
                                    <td class="text-end"><strong>${sentences.median_length} words</strong></td>
                                </tr>
                                <tr>
                                    <td>Standard Deviation</td>
                                    <td class="text-end"><strong>${sentences.std_dev}</strong></td>
                                </tr>
                                <tr>
                                    <td>Shortest Sentence</td>
                                    <td class="text-end"><strong>${sentences.min_length} words</strong></td>
                                </tr>
                                <tr>
                                    <td>Longest Sentence</td>
                                    <td class="text-end"><strong>${sentences.max_length} words</strong></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div class="col-md-6">
                        <h6>Length Distribution</h6>
                        <div class="progress-stacked mt-3">
                            ${renderSentenceDistribution(sentences.distribution)}
                        </div>
                        <div class="mt-2 small">
                            ${renderDistributionLegend(sentences.distribution)}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Render sentence distribution bars
     */
    function renderSentenceDistribution(dist) {
        const total = Object.values(dist).reduce((a, b) => a + b, 0);
        const colors = ['#0d6efd', '#198754', '#ffc107', '#dc3545', '#6c757d', '#0dcaf0'];

        return Object.entries(dist).map(([range, count], i) => {
            const percentage = (count / total * 100).toFixed(1);
            return `
                <div class="progress" role="progressbar"
                     aria-label="${range} words"
                     aria-valuenow="${percentage}"
                     style="width: ${percentage}%; background-color: ${colors[i % colors.length]}">
                    <div class="progress-bar">${percentage > 5 ? percentage + '%' : ''}</div>
                </div>
            `;
        }).join('');
    }

    /**
     * Render distribution legend
     */
    function renderDistributionLegend(dist) {
        const total = Object.values(dist).reduce((a, b) => a + b, 0);
        const colors = ['#0d6efd', '#198754', '#ffc107', '#dc3545', '#6c757d', '#0dcaf0'];

        return Object.entries(dist).map(([range, count], i) => {
            const percentage = (count / total * 100).toFixed(1);
            return `
                <span style="color: ${colors[i % colors.length]}">■</span> ${range} words: ${count} (${percentage}%)
                ${i < Object.keys(dist).length - 1 ? ' | ' : ''}
            `;
        }).join('');
    }

    /**
     * Render vocabulary metrics
     */
    function renderVocabularyMetrics(vocab) {
        return `
            <div class="mt-4">
                <h5>Vocabulary Richness</h5>
                <table class="table table-sm">
                    <tbody>
                        <tr>
                            <td>Total Words</td>
                            <td class="text-end"><strong>${vocab.total_words.toLocaleString()}</strong></td>
                        </tr>
                        <tr>
                            <td>Unique Words</td>
                            <td class="text-end"><strong>${vocab.unique_words.toLocaleString()}</strong></td>
                        </tr>
                        <tr>
                            <td>Type-Token Ratio</td>
                            <td class="text-end"><strong>${vocab.type_token_ratio.toFixed(4)}</strong></td>
                        </tr>
                        <tr>
                            <td>Lexical Diversity</td>
                            <td class="text-end"><strong>${vocab.lexical_diversity.toFixed(4)}</strong></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        `;
    }

    /**
     * Render readability metrics
     */
    function renderReadabilityMetrics(readability) {
        return `
            <div class="mt-4">
                <h5>Readability Scores</h5>
                <table class="table table-sm">
                    <tbody>
                        <tr>
                            <td>Flesch Reading Ease</td>
                            <td class="text-end"><strong>${readability.flesch_reading_ease.toFixed(2)}</strong></td>
                            <td class="small text-muted">${interpretFleschReadingEase(readability.flesch_reading_ease)}</td>
                        </tr>
                        <tr>
                            <td>Flesch-Kincaid Grade</td>
                            <td class="text-end"><strong>${readability.flesch_kincaid_grade.toFixed(2)}</strong></td>
                            <td class="small text-muted">Grade ${Math.round(readability.flesch_kincaid_grade)} level</td>
                        </tr>
                        <tr>
                            <td>Gunning Fog Index</td>
                            <td class="text-end"><strong>${readability.gunning_fog.toFixed(2)}</strong></td>
                            <td class="small text-muted">${interpretGunningFog(readability.gunning_fog)}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        `;
    }

    /**
     * Render word length metrics
     */
    function renderWordLengthMetrics(wordLength) {
        const total = Object.values(wordLength.distribution).reduce((a, b) => a + b, 0);

        return `
            <div class="mt-4">
                <h5>Word Length Analysis</h5>
                <div class="row">
                    <div class="col-md-6">
                        <p><strong>Average Word Length:</strong> ${wordLength.average} characters</p>
                    </div>
                    <div class="col-md-6">
                        <h6>Distribution</h6>
                        <table class="table table-sm">
                            <tbody>
                                ${Object.entries(wordLength.distribution).map(([range, count]) => `
                                    <tr>
                                        <td>${range} chars</td>
                                        <td class="text-end">${count.toLocaleString()}</td>
                                        <td class="text-end text-muted">${(count / total * 100).toFixed(1)}%</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Render punctuation metrics
     */
    function renderPunctuationMetrics(punct) {
        return `
            <div class="mt-4">
                <h5>Punctuation Patterns</h5>
                <div class="row">
                    <div class="col-md-6">
                        <table class="table table-sm">
                            <thead>
                                <tr>
                                    <th>Mark</th>
                                    <th class="text-end">Count</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr><td>Period (.)</td><td class="text-end">${punct.period.toLocaleString()}</td></tr>
                                <tr><td>Comma (,)</td><td class="text-end">${punct.comma.toLocaleString()}</td></tr>
                                <tr><td>Semicolon (;)</td><td class="text-end">${punct.semicolon.toLocaleString()}</td></tr>
                                <tr><td>Colon (:)</td><td class="text-end">${punct.colon.toLocaleString()}</td></tr>
                                <tr><td>Question (?)</td><td class="text-end">${punct.question.toLocaleString()}</td></tr>
                            </tbody>
                        </table>
                    </div>
                    <div class="col-md-6">
                        <table class="table table-sm">
                            <thead>
                                <tr>
                                    <th>Mark</th>
                                    <th class="text-end">Count</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr><td>Exclamation (!)</td><td class="text-end">${punct.exclamation.toLocaleString()}</td></tr>
                                <tr><td>Dash (—)</td><td class="text-end">${punct.dash.toLocaleString()}</td></tr>
                                <tr><td>Parentheses</td><td class="text-end">${punct.parentheses.toLocaleString()}</td></tr>
                                <tr><td>Quotes</td><td class="text-end">${punct.quotes.toLocaleString()}</td></tr>
                                <tr><td colspan="2" class="text-muted"><strong>Density:</strong> ${punct.density_per_1000} per 1,000 words</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Interpret Flesch Reading Ease score
     */
    function interpretFleschReadingEase(score) {
        if (score >= 90) return 'Very Easy';
        if (score >= 80) return 'Easy';
        if (score >= 70) return 'Fairly Easy';
        if (score >= 60) return 'Standard';
        if (score >= 50) return 'Fairly Difficult';
        if (score >= 30) return 'Difficult';
        return 'Very Difficult';
    }

    /**
     * Interpret Gunning Fog Index
     */
    function interpretGunningFog(score) {
        if (score >= 18) return 'Post-graduate';
        if (score >= 14) return 'College level';
        if (score >= 12) return 'High school senior';
        if (score >= 10) return 'High school sophomore';
        if (score >= 8) return 'Middle school';
        return 'Elementary school';
    }

    /**
     * Clear style metrics display
     */
    function clear() {
        const container = document.getElementById('style-metrics-content');
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
