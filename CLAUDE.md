# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This repository contains a distant reading analysis system for Friedrich Nietzsche's philosophical works. It includes:
- 7 major Nietzsche texts from Project Gutenberg (English translations)
- Python analysis pipeline for text preprocessing and computational analysis
- Interactive web visualization interface for exploring the results

## Project Structure

```
hai-week-fourteen-nietzsche/
├── Nietzsche_*.txt          # Source texts (7 files)
├── analysis/                # Python analysis scripts
│   ├── preprocess.py        # Text preprocessing and cleaning
│   ├── analyze_texts.py     # Core analysis (bag-of-words, sentiment, style, n-grams)
│   ├── compare_texts.py     # Comparative analysis
│   └── run_analysis.py      # Main runner script
├── data/                    # Generated analysis data
│   ├── nietzsche_analysis.json  # Full analysis results
│   └── summary.json         # Lightweight summary
├── web/                     # Visualization interface
│   ├── index.html          # Main HTML page
│   ├── css/styles.css      # Custom styling
│   └── js/                 # JavaScript modules
│       ├── app.js          # Main controller
│       ├── data-loader.js  # Data fetching
│       ├── wordcloud.js    # Word cloud generation (d3-cloud)
│       ├── sentiment.js    # Sentiment visualization (Chart.js)
│       ├── style-metrics.js # Style analysis display
│       ├── ngrams.js       # N-grams and concepts
│       └── comparison.js   # Multi-text comparison
└── requirements.txt        # Python dependencies
```

## Available Texts

The repository includes seven major works by Nietzsche:

1. **Beyond Good and Evil** (trans. Helen Zimmern) - 6,503 lines
2. **Ecce Homo** - 6,652 lines
3. **Human, All Too Human** - 4,313 lines
4. **The Antichrist** (trans. H. L. Mencken) - 3,774 lines
5. **The Birth of Tragedy** - 5,832 lines
6. **The Genealogy of Morals** - 5,859 lines
7. **The Twilight of the Idols** - 8,442 lines

All files follow the naming convention: `Nietzsche_[Title].txt`

## Running the Analysis

### Setup

Install Python dependencies:
```bash
pip install -r requirements.txt
```

### Generate Analysis Data

Run the complete analysis pipeline:
```bash
python3 analysis/run_analysis.py
```

This will:
1. Preprocess all 7 texts (strip headers/footers)
2. Perform comprehensive analysis:
   - Bag of words (top 100 words, stopwords removed)
   - Sentiment analysis (VADER)
   - Style metrics (sentence length, vocabulary richness, readability, word length, punctuation)
   - N-grams (bigrams and trigrams)
   - Key philosophical concepts extraction
3. Comparative analysis (vocabulary overlap, similarity matrix)
4. Generate `data/nietzsche_analysis.json` and `data/summary.json`

Expected runtime: ~30-60 seconds

### View Results

Open the web interface:
```bash
cd web
# Open index.html in a web browser
# Or use a local server:
python3 -m http.server 8000
# Then visit: http://localhost:8000
```

## Analysis Features

### Bag of Words
- Top 100 most frequent words (stopwords removed)
- Total vocabulary count
- Visualized as interactive word clouds

### Sentiment Analysis
- VADER sentiment scores (compound, positive, negative, neutral)
- Overall text sentiment classification
- Comparative sentiment charts

### Style Metrics
- **Sentence statistics**: avg/median/std length, min/max, distribution
- **Vocabulary richness**: Type-Token Ratio (TTR), lexical diversity
- **Readability scores**: Flesch Reading Ease, Flesch-Kincaid Grade, Gunning Fog
- **Word length**: average length, distribution by character count
- **Punctuation patterns**: frequency and density per 1,000 words

### N-grams and Concepts
- Top 30 bigrams and trigrams
- Key Nietzschean concepts: "will to power", "übermensch", "eternal recurrence", "master/slave morality", "ressentiment", "nihilism", etc.

### Comparative Analysis
- Pairwise vocabulary overlap (Jaccard similarity)
- Similarity matrix for all texts
- Side-by-side visualizations
- Style metrics comparison tables

## Text File Structure

Each source text file follows the standard Project Gutenberg format:
- **Header section**: Contains Project Gutenberg license, title, author, translator, release date
- **Marker line**: `*** START OF THE PROJECT GUTENBERG EBOOK [TITLE] ***`
- **Main content**: The actual philosophical text
- **Footer section**: `*** END OF THE PROJECT GUTENBERG EBOOK [TITLE] ***` followed by license details

The preprocessing pipeline automatically extracts only the content between START and END markers.

## Development Notes

### Python Modules

- **preprocess.py**: Handles text extraction and cleaning
  - Removes UTF-8 BOM
  - Extracts content between Project Gutenberg markers
  - Cleans excessive whitespace

- **analyze_texts.py**: Core analysis functions
  - Uses NLTK for tokenization and stopwords
  - VADER for sentiment analysis
  - textstat for readability metrics
  - Each function is modular and can be used independently

- **compare_texts.py**: Comparative analysis
  - Vocabulary overlap calculations
  - Jaccard similarity coefficients
  - Statistical summaries

### JavaScript Architecture

The web interface uses a modular architecture:
- **app.js**: Main controller, handles navigation and state
- **data-loader.js**: Fetches and caches JSON data
- **Module pattern**: Each visualization component is self-contained
- **Lazy loading**: Word clouds only render when tab is viewed
- **External libraries**: Bootstrap 5, d3.js, d3-cloud, Chart.js (via CDN)

### Regenerating Analysis

To regenerate analysis after modifying texts or analysis code:
```bash
python3 analysis/run_analysis.py
```

The web interface will automatically load the updated data on refresh.

## Common Commands

### Search across all texts
```bash
# Search for a specific term or concept
grep -i "übermensch\|overman\|superman" *.txt

# Search with context (3 lines before and after)
grep -i -C 3 "eternal recurrence" *.txt

# Count occurrences of a term
grep -o -i "god" *.txt | wc -l
```

### Analyze text statistics
```bash
# Word count for all texts
wc -w *.txt

# Line count for all texts
wc -l *.txt
```

## Licensing

These texts are from Project Gutenberg and are in the public domain in the United States. The Project Gutenberg License allows free copying, distribution, and reuse with minimal restrictions. Always check local laws regarding public domain status when using outside the US.

The analysis code and web interface are part of this repository and can be modified as needed.
