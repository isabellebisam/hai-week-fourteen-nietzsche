"""
Comprehensive text analysis for Nietzsche corpus.
Performs bag-of-words, sentiment analysis, style metrics, n-grams, and concept extraction.
"""

import re
import string
from collections import Counter
import statistics
import nltk
from nltk.tokenize import word_tokenize, sent_tokenize
from nltk.corpus import stopwords
from nltk.util import ngrams as nltk_ngrams
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
import textstat


def ensure_nltk_data():
    """Download required NLTK data if not present."""
    try:
        nltk.data.find('tokenizers/punkt')
    except LookupError:
        print("Downloading NLTK punkt tokenizer...")
        nltk.download('punkt', quiet=True)

    try:
        nltk.data.find('corpora/stopwords')
    except LookupError:
        print("Downloading NLTK stopwords...")
        nltk.download('stopwords', quiet=True)


def analyze_bag_of_words(text, top_n=100):
    """
    Create bag of words with stopwords removed.

    Args:
        text: Input text
        top_n: Number of top words to return

    Returns:
        Dictionary with word frequencies
    """
    # Tokenize
    words = word_tokenize(text.lower())

    # Remove stopwords and punctuation
    stop_words = set(stopwords.words('english'))
    words = [w for w in words if w.isalpha() and w not in stop_words and len(w) > 2]

    # Count frequencies
    word_freq = Counter(words)

    # Get top N words
    top_words = [{"word": word, "count": count} for word, count in word_freq.most_common(top_n)]

    return {
        "top_100": top_words,
        "total_vocabulary": len(word_freq),
        "total_words_analyzed": len(words)
    }


def analyze_sentiment(text):
    """
    Perform sentiment analysis using VADER.

    Args:
        text: Input text

    Returns:
        Dictionary with sentiment scores
    """
    analyzer = SentimentIntensityAnalyzer()

    # Get overall sentiment for the entire text
    # For very long texts, we'll analyze in chunks and average
    max_chunk_size = 10000
    if len(text) > max_chunk_size:
        # Split into chunks
        chunks = [text[i:i+max_chunk_size] for i in range(0, len(text), max_chunk_size)]
        scores = [analyzer.polarity_scores(chunk) for chunk in chunks]

        # Average the scores
        avg_scores = {
            'compound': statistics.mean(s['compound'] for s in scores),
            'pos': statistics.mean(s['pos'] for s in scores),
            'neu': statistics.mean(s['neu'] for s in scores),
            'neg': statistics.mean(s['neg'] for s in scores)
        }
    else:
        avg_scores = analyzer.polarity_scores(text)

    return {
        "vader": {
            "compound": round(avg_scores['compound'], 4),
            "positive": round(avg_scores['pos'], 4),
            "negative": round(avg_scores['neg'], 4),
            "neutral": round(avg_scores['neu'], 4)
        }
    }


def analyze_sentences(text):
    """
    Analyze sentence-level statistics.

    Args:
        text: Input text

    Returns:
        Dictionary with sentence statistics
    """
    sentences = sent_tokenize(text)
    sentence_lengths = [len(word_tokenize(sent)) for sent in sentences]

    # Calculate distribution bins
    bins = {
        "0-10": 0,
        "11-20": 0,
        "21-30": 0,
        "31-40": 0,
        "41-50": 0,
        "51+": 0
    }

    for length in sentence_lengths:
        if length <= 10:
            bins["0-10"] += 1
        elif length <= 20:
            bins["11-20"] += 1
        elif length <= 30:
            bins["21-30"] += 1
        elif length <= 40:
            bins["31-40"] += 1
        elif length <= 50:
            bins["41-50"] += 1
        else:
            bins["51+"] += 1

    return {
        "count": len(sentences),
        "avg_length": round(statistics.mean(sentence_lengths), 2) if sentence_lengths else 0,
        "median_length": round(statistics.median(sentence_lengths), 2) if sentence_lengths else 0,
        "std_dev": round(statistics.stdev(sentence_lengths), 2) if len(sentence_lengths) > 1 else 0,
        "min_length": min(sentence_lengths) if sentence_lengths else 0,
        "max_length": max(sentence_lengths) if sentence_lengths else 0,
        "distribution": bins
    }


def analyze_vocabulary(text):
    """
    Analyze vocabulary richness.

    Args:
        text: Input text

    Returns:
        Dictionary with vocabulary metrics
    """
    words = word_tokenize(text.lower())
    words = [w for w in words if w.isalpha()]

    total_words = len(words)
    unique_words = len(set(words))

    # Type-Token Ratio (TTR)
    ttr = unique_words / total_words if total_words > 0 else 0

    # Lexical diversity (unique words / sqrt(total words)) - more stable for long texts
    lexical_diversity = unique_words / (total_words ** 0.5) if total_words > 0 else 0

    return {
        "total_words": total_words,
        "unique_words": unique_words,
        "type_token_ratio": round(ttr, 4),
        "lexical_diversity": round(lexical_diversity, 4)
    }


def analyze_readability(text):
    """
    Calculate readability scores.

    Args:
        text: Input text

    Returns:
        Dictionary with readability metrics
    """
    return {
        "flesch_reading_ease": round(textstat.flesch_reading_ease(text), 2),
        "flesch_kincaid_grade": round(textstat.flesch_kincaid_grade(text), 2),
        "gunning_fog": round(textstat.gunning_fog(text), 2)
    }


def analyze_word_length(text):
    """
    Analyze word length distribution.

    Args:
        text: Input text

    Returns:
        Dictionary with word length metrics
    """
    words = word_tokenize(text.lower())
    words = [w for w in words if w.isalpha()]

    word_lengths = [len(w) for w in words]

    # Distribution bins
    distribution = {
        "1-3": sum(1 for l in word_lengths if 1 <= l <= 3),
        "4-6": sum(1 for l in word_lengths if 4 <= l <= 6),
        "7-9": sum(1 for l in word_lengths if 7 <= l <= 9),
        "10+": sum(1 for l in word_lengths if l >= 10)
    }

    return {
        "average": round(statistics.mean(word_lengths), 2) if word_lengths else 0,
        "distribution": distribution
    }


def analyze_punctuation(text):
    """
    Analyze punctuation patterns.

    Args:
        text: Input text

    Returns:
        Dictionary with punctuation counts and density
    """
    # Count specific punctuation marks
    punctuation_counts = {
        "period": text.count('.'),
        "exclamation": text.count('!'),
        "question": text.count('?'),
        "semicolon": text.count(';'),
        "colon": text.count(':'),
        "comma": text.count(','),
        "dash": text.count('—') + text.count('--'),
        "parentheses": text.count('(') + text.count(')'),
        "quotes": text.count('"') + text.count("'")
    }

    # Calculate density (per 1000 words)
    words = word_tokenize(text)
    word_count = len([w for w in words if w.isalpha()])
    total_punctuation = sum(punctuation_counts.values())

    density = (total_punctuation / word_count * 1000) if word_count > 0 else 0

    return {
        **punctuation_counts,
        "density_per_1000": round(density, 2)
    }


def extract_ngrams(text, n=2, top_k=30):
    """
    Extract n-grams from text.

    Args:
        text: Input text
        n: N-gram size (2 for bigrams, 3 for trigrams)
        top_k: Number of top n-grams to return

    Returns:
        List of n-grams with frequencies
    """
    words = word_tokenize(text.lower())

    # Remove stopwords and punctuation
    stop_words = set(stopwords.words('english'))
    words = [w for w in words if w.isalpha() and len(w) > 2]

    # Generate n-grams
    ngram_list = list(nltk_ngrams(words, n))

    # Filter out n-grams that are all stopwords
    ngram_list = [ng for ng in ngram_list if not all(w in stop_words for w in ng)]

    # Count frequencies
    ngram_freq = Counter(ngram_list)

    # Convert to list of dictionaries
    top_ngrams = [
        {"phrase": " ".join(ngram), "count": count}
        for ngram, count in ngram_freq.most_common(top_k)
    ]

    return top_ngrams


def extract_key_concepts(text):
    """
    Extract key Nietzschean philosophical concepts.

    Args:
        text: Input text

    Returns:
        List of concepts with counts
    """
    # Define key Nietzschean concepts with variations
    concepts = {
        "will to power": [r'\bwill[- ]to[- ]power\b', r'\bwill-to-power\b'],
        "übermensch": [r'\b[uü]bermensch\b', r'\boverman\b', r'\bsuperman\b'],
        "eternal recurrence": [r'\beternal\s+recurrence\b', r'\beternal\s+return\b'],
        "master morality": [r'\bmaster\s+morality\b', r'\bmaster-morality\b'],
        "slave morality": [r'\bslave\s+morality\b', r'\bslave-morality\b'],
        "ressentiment": [r'\bressentiment\b', r'\bresentment\b'],
        "nihilism": [r'\bnihilism\b', r'\bnihilist\b'],
        "genealogy": [r'\bgenealogy\b', r'\bgeneaological\b'],
        "perspectivism": [r'\bperspectiv\w*\b'],
        "dionysian": [r'\bdionysian\b', r'\bdionysos\b'],
        "apollonian": [r'\bapollonian\b', r'\bapollo\b'],
        "god is dead": [r'\bgod\s+is\s+dead\b'],
        "amor fati": [r'\bamor\s+fati\b']
    }

    results = []

    for concept, patterns in concepts.items():
        total_count = 0
        variants_found = []

        for pattern in patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            if matches:
                total_count += len(matches)
                variants_found.extend(set(matches))

        if total_count > 0:
            results.append({
                "term": concept,
                "count": total_count,
                "variants": list(set(variants_found))[:5]  # Top 5 variants
            })

    # Sort by count
    results.sort(key=lambda x: x['count'], reverse=True)

    return results


def analyze_text(text_id, text_content, metadata):
    """
    Perform comprehensive analysis on a single text.

    Args:
        text_id: Unique identifier for the text
        text_content: The text content to analyze
        metadata: Text metadata (title, filename, etc.)

    Returns:
        Complete analysis dictionary
    """
    print(f"\nAnalyzing: {metadata['title']}")

    # Bag of words
    print("  - Bag of words...")
    bow = analyze_bag_of_words(text_content)

    # Sentiment analysis
    print("  - Sentiment analysis...")
    sentiment = analyze_sentiment(text_content)

    # Style metrics
    print("  - Style metrics...")
    sentences = analyze_sentences(text_content)
    vocabulary = analyze_vocabulary(text_content)
    readability = analyze_readability(text_content)
    word_length = analyze_word_length(text_content)
    punctuation = analyze_punctuation(text_content)

    # N-grams
    print("  - N-grams...")
    bigrams = extract_ngrams(text_content, n=2, top_k=30)
    trigrams = extract_ngrams(text_content, n=3, top_k=30)

    # Key concepts
    print("  - Key concepts...")
    concepts = extract_key_concepts(text_content)

    return {
        "id": text_id,
        "title": metadata['title'],
        "filename": metadata['filename'],
        "word_count": vocabulary['total_words'],
        "unique_words": vocabulary['unique_words'],
        "bag_of_words": bow,
        "sentiment": sentiment,
        "style_metrics": {
            "sentences": sentences,
            "vocabulary": vocabulary,
            "readability": readability,
            "word_length": word_length,
            "punctuation": punctuation
        },
        "ngrams": {
            "bigrams": bigrams,
            "trigrams": trigrams
        },
        "key_concepts": concepts
    }


if __name__ == '__main__':
    # Setup NLTK
    ensure_nltk_data()

    # Test with sample text
    sample_text = """
    The will to power is the fundamental driving force in humans.
    The Übermensch represents a goal for humanity to set for itself.
    God is dead, and we have killed him.
    """

    print("Testing analysis functions...")
    results = analyze_text(
        "test",
        sample_text,
        {"title": "Test Text", "filename": "test.txt"}
    )

    print("\nTest complete!")
    print(f"Sentiment: {results['sentiment']}")
    print(f"Concepts found: {len(results['key_concepts'])}")
