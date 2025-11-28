"""
Comparative analysis module for Nietzsche corpus.
Computes vocabulary overlap, similarities, and comparative metrics.
"""

import statistics
from nltk.tokenize import word_tokenize


def calculate_vocabulary_overlap(text1_content, text2_content, text1_id, text2_id):
    """
    Calculate vocabulary overlap between two texts.

    Args:
        text1_content: Content of first text
        text2_content: Content of second text
        text1_id: ID of first text
        text2_id: ID of second text

    Returns:
        Dictionary with overlap metrics
    """
    # Tokenize and get unique words
    words1 = set(w.lower() for w in word_tokenize(text1_content) if w.isalpha())
    words2 = set(w.lower() for w in word_tokenize(text2_content) if w.isalpha())

    # Calculate overlap
    shared = words1 & words2
    unique_to_1 = words1 - words2
    unique_to_2 = words2 - words1

    # Jaccard similarity: |intersection| / |union|
    union = words1 | words2
    jaccard = len(shared) / len(union) if union else 0

    return {
        "text1": text1_id,
        "text2": text2_id,
        "shared_words": len(shared),
        "unique_to_text1": len(unique_to_1),
        "unique_to_text2": len(unique_to_2),
        "jaccard_similarity": round(jaccard, 4),
        "overlap_percentage_text1": round(len(shared) / len(words1) * 100, 2) if words1 else 0,
        "overlap_percentage_text2": round(len(shared) / len(words2) * 100, 2) if words2 else 0
    }


def compare_all_texts(texts_data):
    """
    Perform pairwise comparisons of all texts.

    Args:
        texts_data: Dictionary with text IDs as keys and content/metadata as values

    Returns:
        Dictionary with comparative analysis results
    """
    print("\nPerforming comparative analysis...")

    text_ids = list(texts_data.keys())
    pairs = []
    matrix = {}

    # Initialize similarity matrix
    for text_id in text_ids:
        matrix[text_id] = {}
        for other_id in text_ids:
            if text_id == other_id:
                matrix[text_id][other_id] = 1.0
            else:
                matrix[text_id][other_id] = 0.0

    # Compare each pair
    total_pairs = len(text_ids) * (len(text_ids) - 1) // 2
    current = 0

    for i, text1_id in enumerate(text_ids):
        for text2_id in text_ids[i+1:]:
            current += 1
            print(f"  Comparing pair {current}/{total_pairs}: {text1_id} vs {text2_id}")

            overlap = calculate_vocabulary_overlap(
                texts_data[text1_id]['content'],
                texts_data[text2_id]['content'],
                text1_id,
                text2_id
            )

            pairs.append(overlap)

            # Update similarity matrix
            similarity = overlap['jaccard_similarity']
            matrix[text1_id][text2_id] = similarity
            matrix[text2_id][text1_id] = similarity

    return {
        "pairs": pairs,
        "similarity_matrix": matrix
    }


def compare_sentiments(analyses):
    """
    Create sentiment comparison summary.

    Args:
        analyses: List of text analysis results

    Returns:
        Dictionary with sentiment comparison metrics
    """
    compounds = [a['sentiment']['vader']['compound'] for a in analyses]
    positives = [a['sentiment']['vader']['positive'] for a in analyses]
    negatives = [a['sentiment']['vader']['negative'] for a in analyses]
    neutrals = [a['sentiment']['vader']['neutral'] for a in analyses]

    return {
        "compound": {
            "mean": round(statistics.mean(compounds), 4),
            "std_dev": round(statistics.stdev(compounds), 4) if len(compounds) > 1 else 0,
            "min": round(min(compounds), 4),
            "max": round(max(compounds), 4),
            "range": round(max(compounds) - min(compounds), 4)
        },
        "positive": {
            "mean": round(statistics.mean(positives), 4),
            "std_dev": round(statistics.stdev(positives), 4) if len(positives) > 1 else 0
        },
        "negative": {
            "mean": round(statistics.mean(negatives), 4),
            "std_dev": round(statistics.stdev(negatives), 4) if len(negatives) > 1 else 0
        },
        "neutral": {
            "mean": round(statistics.mean(neutrals), 4),
            "std_dev": round(statistics.stdev(neutrals), 4) if len(neutrals) > 1 else 0
        }
    }


def compare_style_metrics(analyses):
    """
    Create style metrics comparison summary.

    Args:
        analyses: List of text analysis results

    Returns:
        Dictionary with style comparison metrics
    """
    # Sentence length
    avg_sentence_lengths = [a['style_metrics']['sentences']['avg_length'] for a in analyses]

    # Vocabulary richness
    ttrs = [a['style_metrics']['vocabulary']['type_token_ratio'] for a in analyses]

    # Readability
    flesch_scores = [a['style_metrics']['readability']['flesch_reading_ease'] for a in analyses]
    fk_grades = [a['style_metrics']['readability']['flesch_kincaid_grade'] for a in analyses]

    # Word length
    avg_word_lengths = [a['style_metrics']['word_length']['average'] for a in analyses]

    return {
        "sentence_length": {
            "mean": round(statistics.mean(avg_sentence_lengths), 2),
            "std_dev": round(statistics.stdev(avg_sentence_lengths), 2) if len(avg_sentence_lengths) > 1 else 0,
            "range": [round(min(avg_sentence_lengths), 2), round(max(avg_sentence_lengths), 2)]
        },
        "type_token_ratio": {
            "mean": round(statistics.mean(ttrs), 4),
            "std_dev": round(statistics.stdev(ttrs), 4) if len(ttrs) > 1 else 0,
            "range": [round(min(ttrs), 4), round(max(ttrs), 4)]
        },
        "flesch_reading_ease": {
            "mean": round(statistics.mean(flesch_scores), 2),
            "std_dev": round(statistics.stdev(flesch_scores), 2) if len(flesch_scores) > 1 else 0,
            "range": [round(min(flesch_scores), 2), round(max(flesch_scores), 2)]
        },
        "flesch_kincaid_grade": {
            "mean": round(statistics.mean(fk_grades), 2),
            "std_dev": round(statistics.stdev(fk_grades), 2) if len(fk_grades) > 1 else 0,
            "range": [round(min(fk_grades), 2), round(max(fk_grades), 2)]
        },
        "avg_word_length": {
            "mean": round(statistics.mean(avg_word_lengths), 2),
            "std_dev": round(statistics.stdev(avg_word_lengths), 2) if len(avg_word_lengths) > 1 else 0,
            "range": [round(min(avg_word_lengths), 2), round(max(avg_word_lengths), 2)]
        }
    }


if __name__ == '__main__':
    print("Comparative analysis module loaded successfully.")
