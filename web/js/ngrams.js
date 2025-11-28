/**
 * N-grams and Concepts Module
 * Displays n-grams and key philosophical concepts
 */

const NGrams = (function() {
    let currentNgramType = 'bigrams';

    /**
     * Display n-grams and concepts for a text
     * @param {Object} textData - Text analysis data
     */
    function display(textData) {
        displayConcepts(textData.key_concepts);
        displayNGrams(textData.ngrams[currentNgramType], currentNgramType);
        setupNGramSwitcher(textData.ngrams);
    }

    /**
     * Display key philosophical concepts
     * @param {Array} concepts - Array of concept objects
     */
    function displayConcepts(concepts) {
        const container = document.getElementById('concepts-list');
        if (!container) return;

        if (!concepts || concepts.length === 0) {
            container.innerHTML = '<p class="text-muted">No key concepts detected in this text.</p>';
            return;
        }

        container.innerHTML = concepts.map(concept => `
            <div class="concept-item">
                <div>
                    <div class="concept-term">${escapeHtml(concept.term)}</div>
                    ${concept.variants && concept.variants.length > 0
                        ? `<div class="concept-variants">Variants: ${concept.variants.map(escapeHtml).join(', ')}</div>`
                        : ''}
                </div>
                <div class="concept-count">${concept.count}</div>
            </div>
        `).join('');
    }

    /**
     * Display n-grams list
     * @param {Array} ngrams - Array of n-gram objects
     * @param {string} type - Type of n-grams ('bigrams' or 'trigrams')
     */
    function displayNGrams(ngrams, type) {
        const container = document.getElementById('ngrams-list');
        if (!container) return;

        if (!ngrams || ngrams.length === 0) {
            container.innerHTML = '<p class="text-muted">No n-grams available.</p>';
            return;
        }

        const title = type === 'bigrams' ? '2-word Phrases' : '3-word Phrases';

        container.innerHTML = `
            <div class="mb-2">
                <strong>Top ${ngrams.length} ${title}</strong>
            </div>
            ${ngrams.map((ngram, index) => `
                <div class="ngram-item">
                    <div>
                        <span class="text-muted me-2">${index + 1}.</span>
                        <span class="ngram-phrase">${escapeHtml(ngram.phrase)}</span>
                    </div>
                    <div class="ngram-count">${ngram.count}</div>
                </div>
            `).join('')}
        `;
    }

    /**
     * Setup n-gram type switcher
     * @param {Object} allNgrams - Object containing bigrams and trigrams
     */
    function setupNGramSwitcher(allNgrams) {
        const pills = document.querySelectorAll('#ngram-pills .nav-link');

        pills.forEach(pill => {
            pill.addEventListener('click', (e) => {
                e.preventDefault();

                // Update active state
                pills.forEach(p => p.classList.remove('active'));
                pill.classList.add('active');

                // Get ngram type and display
                const type = pill.dataset.ngram;
                currentNgramType = type;
                displayNGrams(allNgrams[type], type);
            });
        });
    }

    /**
     * Display n-gram comparison
     * @param {Array} textsData - Array of text data objects
     * @param {string} type - 'bigrams' or 'trigrams'
     */
    function displayComparison(textsData, type = 'bigrams') {
        const container = document.getElementById('ngrams-comparison');
        if (!container) return;

        container.innerHTML = textsData.map(textData => `
            <div class="col-md-6">
                <h6>${textData.title}</h6>
                <div class="ngrams-list-small">
                    ${textData.ngrams[type].slice(0, 10).map((ngram, i) => `
                        <div class="ngram-item small">
                            <span>${i + 1}. ${escapeHtml(ngram.phrase)}</span>
                            <span class="badge bg-secondary">${ngram.count}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('');
    }

    /**
     * Display concept comparison
     * @param {Array} textsData - Array of text data objects
     */
    function displayConceptComparison(textsData) {
        const container = document.getElementById('concepts-comparison');
        if (!container) return;

        // Collect all unique concepts
        const allConcepts = new Set();
        textsData.forEach(text => {
            text.key_concepts.forEach(c => allConcepts.add(c.term));
        });

        // Create comparison table
        const conceptsArray = Array.from(allConcepts);

        let html = `
            <table class="table table-sm table-hover">
                <thead>
                    <tr>
                        <th>Concept</th>
                        ${textsData.map(t => `<th class="text-center">${t.title.length > 20 ? t.title.substring(0, 20) + '...' : t.title}</th>`).join('')}
                    </tr>
                </thead>
                <tbody>
        `;

        conceptsArray.forEach(conceptTerm => {
            html += `<tr><td><strong>${escapeHtml(conceptTerm)}</strong></td>`;

            textsData.forEach(text => {
                const concept = text.key_concepts.find(c => c.term === conceptTerm);
                const count = concept ? concept.count : 0;
                const className = count > 0 ? '' : 'text-muted';
                html += `<td class="text-center ${className}">${count > 0 ? count : '—'}</td>`;
            });

            html += '</tr>';
        });

        html += '</tbody></table>';

        container.innerHTML = html;
    }

    /**
     * Escape HTML to prevent XSS
     * @param {string} text - Text to escape
     * @returns {string} Escaped text
     */
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Clear n-grams and concepts display
     */
    function clear() {
        const conceptsContainer = document.getElementById('concepts-list');
        if (conceptsContainer) {
            conceptsContainer.innerHTML = '';
        }

        const ngramsContainer = document.getElementById('ngrams-list');
        if (ngramsContainer) {
            ngramsContainer.innerHTML = '';
        }

        currentNgramType = 'bigrams';
    }

    // Public API
    return {
        display,
        displayComparison,
        displayConceptComparison,
        clear
    };
})();
