/**
 * Main Application Controller
 * Orchestrates the Nietzsche Distant Reading Analysis interface
 */

/* =========================
   THEME CONTROL FUNCTIONS
   ========================= */
function applyTheme(theme) {
    const body = document.body;
    const toggleBtn = document.getElementById('theme-toggle');

    if (theme === 'dark') {
        body.classList.add('dark-mode');
        toggleBtn.textContent = '☀ Light mode';
    } else {
        body.classList.remove('dark-mode');
        toggleBtn.textContent = '🌙 Dark mode';
    }
}

(function() {
    let allTexts = [];
    let currentText = null;
    let selectedTextsForComparison = new Set();
    let comparativeData = null;

    /**
     * Initialize the application
     */
    async function init() {
        try {

            /* Load saved theme preference BEFORE UI renders */
            const savedTheme = localStorage.getItem('theme') || 'light';
            document.documentElement.classList.toggle('dark-mode', savedTheme === 'dark');

            // Load data
            console.log('Loading analysis data...');
            const data = await DataLoader.loadData();
            allTexts = data.texts;
            comparativeData = data.comparative;

            console.log(`Loaded ${allTexts.length} texts`);

            // Setup UI
            populateTextSelector();
            setupEventListeners();

            console.log('Application initialized successfully');
        } catch (error) {
            console.error('Failed to initialize application:', error);
            showError('Failed to load analysis data. Please ensure the JSON file is accessible.');
        }
    }

    /**
     * Populate the text selector sidebar
     */
    function populateTextSelector() {
        const selector = document.getElementById('text-selector');
        const checkboxes = document.getElementById('comparison-checkboxes');

        if (!selector || !checkboxes) return;

        // Create list items for single selection
        selector.innerHTML = allTexts.map(text => `
            <a href="#" class="list-group-item list-group-item-action" data-text-id="${text.id}">
                ${text.title}
            </a>
        `).join('');

        // Create checkboxes for comparison
        checkboxes.innerHTML = allTexts.map(text => `
            <div class="form-check">
                <input class="form-check-input comparison-checkbox"
                       type="checkbox"
                       id="compare-${text.id}"
                       data-text-id="${text.id}">
                <label class="form-check-label small" for="compare-${text.id}">
                    ${text.title}
                </label>
            </div>
        `).join('');
    }

    /**
     * Setup event listeners
     */
    function setupEventListeners() {
        // Text selection
        document.querySelectorAll('#text-selector .list-group-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const textId = e.currentTarget.dataset.textId;
                selectText(textId);
            });
        });

        // Comparison checkboxes
        document.querySelectorAll('.comparison-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const textId = e.target.dataset.textId;
                if (e.target.checked) {
                    selectedTextsForComparison.add(textId);
                } else {
                    selectedTextsForComparison.delete(textId);
                }
                updateCompareButton();
            });
        });

        // Compare button
        const compareBtn = document.getElementById('compare-btn');
        if (compareBtn) {
            compareBtn.addEventListener('click', () => {
                if (selectedTextsForComparison.size >= 2) {
                    showComparison();
                }
            });
        }

        // Close comparison button
        const closeComparisonBtn = document.getElementById('close-comparison');
        if (closeComparisonBtn) {
            closeComparisonBtn.addEventListener('click', () => {
                closeComparison();
            });
        }

        // Tab switching - lazy load word cloud
        const wordcloudTab = document.getElementById('wordcloud-tab');
        if (wordcloudTab) {
            wordcloudTab.addEventListener('shown.bs.tab', () => {
                if (currentText) {
                    WordCloud.generateForText(currentText);
                }
            });
        }
    }

    /**
     * Select and display a text
     */
    function selectText(textId) {
        const text = allTexts.find(t => t.id === textId);
        if (!text) return;

        currentText = text;

        // Update UI active state
        document.querySelectorAll('#text-selector .list-group-item').forEach(item => {
            item.classList.toggle('active', item.dataset.textId === textId);
        });

        // Show tabs and content
        document.getElementById('analysis-tabs').style.display = 'flex';
        document.getElementById('tab-content').style.display = 'block';

        // Display text info
        displayTextInfo(text);

        // Display analysis in each tab
        displayOverview(text);
        Sentiment.display(text);
        StyleMetrics.display(text);
        NGrams.display(text);

        // Word cloud will be generated when tab is shown (lazy loading)

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    /**
     * Display text information
     */
    function displayTextInfo(text) {
        const titleEl = document.getElementById('text-title');
        const metadataEl = document.getElementById('text-metadata');

        if (titleEl) {
            titleEl.textContent = text.title;
        }

        if (metadataEl) {
            metadataEl.textContent = `${text.word_count.toLocaleString()} words • ${text.unique_words.toLocaleString()} unique words`;
        }
    }

    /**
     * Display overview statistics
     */
    function displayOverview(text) {
        const statsEl = document.getElementById('overview-stats');
        const insightsEl = document.getElementById('quick-insights');

   // ----------------- SUMMARY AREA ------------------
const summaryEl = document.getElementById('overview-summary-text');

      if (summaryEl) {
         const summaries = {
              'Ecce Homo': 'Nietzsche revisits his life, philosophy and creative mind, blending reflection, pride and self-irony.',
              'Human All Too Human': 'A transitional work — sharp, analytical, dismantling metaphysics and morality with psychological critique.',
              'Beyond Good and Evil': 'Goes beyond traditional morality — values, power, perspectivism and the critique of dogmatic thinking.',
              'The Antichrist': 'A fierce confrontation with Christianity — power, instinct, life-affirmation vs denial and guilt.',
              'The Birth of Tragedy': 'Dionysian vs Apollonian — art, chaos, form, Greek tragedy as the height of human creation.',
              'The Genealogy of Morals': 'Origins of guilt, punishment, resentment — psychology of morality and power.',
              'The Twilight of the Idols': 'Nietzsche dismantles idols — reason, morality, philosophy, religion — with hammer-blows.'
         };

         summaryEl.textContent = summaries[text.title] 
            || 'Summary coming soon.';
}
// ---------------------------------------------------

        if (statsEl) {
            statsEl.innerHTML = `
                <tr>
                    <td>Total Words</td>
                    <td class="text-end"><strong>${text.word_count.toLocaleString()}</strong></td>
                </tr>
                <tr>
                    <td>Unique Words</td>
                    <td class="text-end"><strong>${text.unique_words.toLocaleString()}</strong></td>
                </tr>
                <tr>
                    <td>Sentences</td>
                    <td class="text-end"><strong>${text.style_metrics.sentences.count.toLocaleString()}</strong></td>
                </tr>
                <tr>
                    <td>Type-Token Ratio</td>
                    <td class="text-end"><strong>${text.style_metrics.vocabulary.type_token_ratio.toFixed(4)}</strong></td>
                </tr>
                <tr>
                    <td>Reading Ease</td>
                    <td class="text-end"><strong>${text.style_metrics.readability.flesch_reading_ease.toFixed(1)}</strong></td>
                </tr>
                <tr>
                    <td>Grade Level</td>
                    <td class="text-end"><strong>${text.style_metrics.readability.flesch_kincaid_grade.toFixed(1)}</strong></td>
                </tr>
            `;
        }

        if (insightsEl) {
            const sentiment = text.sentiment.vader.compound;
            const sentimentLabel = sentiment > 0.5 ? 'Positive' :
                                  sentiment > 0 ? 'Moderately Positive' :
                                  sentiment > -0.5 ? 'Moderately Negative' : 'Negative';

            insightsEl.innerHTML = `
                <div class="alert alert-info">
                    <h6>Overall Sentiment</h6>
                    <p class="mb-1"><strong>${sentimentLabel}</strong> (${sentiment.toFixed(4)})</p>
                    <p class="small mb-0">Based on VADER sentiment analysis</p>
                </div>
                <div class="alert alert-secondary">
                    <h6>Key Concepts Found</h6>
                    <p class="mb-1"><strong>${text.key_concepts.length}</strong> philosophical concepts detected</p>
                    ${text.key_concepts.length > 0
                        ? `<p class="small mb-0">Most frequent: <strong>${text.key_concepts[0].term}</strong> (${text.key_concepts[0].count} occurrences)</p>`
                        : '<p class="small mb-0">No key concepts detected</p>'}
                </div>
            `;
        }
    }

    /**
     * Update compare button state
     */
    function updateCompareButton() {
        const compareBtn = document.getElementById('compare-btn');
        if (compareBtn) {
            const count = selectedTextsForComparison.size;
            compareBtn.disabled = count < 2;
            compareBtn.textContent = count >= 2
                ? `Compare ${count} Texts`
                : 'Select 2+ Texts';
        }
    }

    /**
     * Show comparison view
     */
    async function showComparison() {
        const selectedTexts = allTexts.filter(t => selectedTextsForComparison.has(t.id));

        if (selectedTexts.length < 2) return;

        // Hide single text view
        document.getElementById('single-text-view').style.display = 'none';

        // Show comparison view
        const comparisonView = document.getElementById('comparison-view');
        comparisonView.style.display = 'block';

        // Display comparison
        await Comparison.display(selectedTexts, comparativeData);

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    /**
     * Close comparison view
     */
    function closeComparison() {
        // Hide comparison view
        document.getElementById('comparison-view').style.display = 'none';

        // Show single text view
        document.getElementById('single-text-view').style.display = 'block';

        // Clear comparison selection
        selectedTextsForComparison.clear();
        document.querySelectorAll('.comparison-checkbox').forEach(cb => {
            cb.checked = false;
        });
        updateCompareButton();

        // Clear comparison content
        Comparison.clear();
    }

    /**
     * Show error message
     */
    function showError(message) {
        const titleEl = document.getElementById('text-title');
        if (titleEl) {
            titleEl.innerHTML = `
                <div class="alert alert-danger">
                    <h5>Error</h5>
                    <p>${message}</p>
                </div>
            `;
        }
    }

   // Initialize when DOM is ready
if (document.readyState === 'loading') {

    document.addEventListener('DOMContentLoaded', () => {
        
        // 🔥 Carrega tema salvo
        const savedTheme = localStorage.getItem('theme') || 'light';
        applyTheme(savedTheme);

        // 🔥 Listener do botão Dark Mode
        const toggleBtn = document.getElementById('theme-toggle');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                const newTheme = document.body.classList.contains('dark-mode') ? 'light' : 'dark';
                localStorage.setItem('theme', newTheme);
                applyTheme(newTheme);
            });
        }

        // 🔥 Botão PDF (se existir)
        const pdfBtn = document.getElementById('export-pdf');
        if (pdfBtn) pdfBtn.addEventListener('click', () => window.print());

        init(); // ⬅ só roda depois de configurar o tema
    });

} else {

    // 🔥 Carrega tema salvo
    const savedTheme = localStorage.getItem('theme') || 'light';
    applyTheme(savedTheme);

    // 🔥 Listener do botão Dark Mode
    const toggleBtn = document.getElementById('theme-toggle');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            const newTheme = document.body.classList.contains('dark-mode') ? 'light' : 'dark';
            localStorage.setItem('theme', newTheme);
            applyTheme(newTheme);
        });
    }

    // 🔥 Botão PDF
    const pdfBtn = document.getElementById('export-pdf');
    if (pdfBtn) pdfBtn.addEventListener('click', () => window.print());

    init(); // ⬅ só roda depois do tema
}

})();



