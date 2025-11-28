#!/usr/bin/env python3
"""
Main analysis runner for Nietzsche corpus.
Orchestrates preprocessing, analysis, comparison, and JSON output.
"""

import json
import sys
from datetime import datetime
from pathlib import Path

# Import our modules
from preprocess import preprocess_all_texts
from analyze_texts import analyze_text, ensure_nltk_data
from compare_texts import compare_all_texts, compare_sentiments, compare_style_metrics


def main():
    """Main analysis pipeline."""
    print("=" * 60)
    print("Nietzsche Corpus Distant Reading Analysis")
    print("=" * 60)

    # Setup
    base_dir = Path(__file__).parent.parent
    data_dir = base_dir / 'data'
    data_dir.mkdir(exist_ok=True)

    # Ensure NLTK data is available
    print("\nSetting up NLTK data...")
    ensure_nltk_data()

    # Step 1: Preprocess all texts
    print("\n" + "=" * 60)
    print("Step 1: Preprocessing texts")
    print("=" * 60)
    texts_data = preprocess_all_texts(base_dir)

    # Step 2: Analyze each text
    print("\n" + "=" * 60)
    print("Step 2: Analyzing texts")
    print("=" * 60)

    analyses = []
    for text_id, data in texts_data.items():
        analysis = analyze_text(
            text_id,
            data['content'],
            data['metadata']
        )
        analyses.append(analysis)

    # Step 3: Comparative analysis
    print("\n" + "=" * 60)
    print("Step 3: Comparative analysis")
    print("=" * 60)

    vocabulary_comparison = compare_all_texts(texts_data)
    sentiment_comparison = compare_sentiments(analyses)
    style_comparison = compare_style_metrics(analyses)

    # Step 4: Build final JSON structure
    print("\n" + "=" * 60)
    print("Step 4: Building output JSON")
    print("=" * 60)

    output = {
        "metadata": {
            "generated": datetime.now().isoformat(),
            "total_texts": len(analyses),
            "analysis_version": "1.0"
        },
        "texts": analyses,
        "comparative": {
            "vocabulary_overlap": vocabulary_comparison,
            "sentiment_summary": sentiment_comparison,
            "style_summary": style_comparison
        }
    }

    # Step 5: Write to JSON file
    output_path = data_dir / 'nietzsche_analysis.json'
    print(f"\nWriting analysis to: {output_path}")

    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(output, f, indent=2, ensure_ascii=False)

    file_size = output_path.stat().st_size / 1024 / 1024  # MB
    print(f"Output file size: {file_size:.2f} MB")

    # Optional: Create summary JSON
    print("\nCreating summary JSON...")
    summary = {
        "metadata": output["metadata"],
        "texts": [
            {
                "id": t["id"],
                "title": t["title"],
                "word_count": t["word_count"],
                "unique_words": t["unique_words"],
                "sentiment": t["sentiment"]["vader"]["compound"],
                "readability": t["style_metrics"]["readability"]["flesch_reading_ease"]
            }
            for t in analyses
        ],
        "comparative": {
            "sentiment_summary": sentiment_comparison,
            "style_summary": style_comparison
        }
    }

    summary_path = data_dir / 'summary.json'
    with open(summary_path, 'w', encoding='utf-8') as f:
        json.dump(summary, f, indent=2, ensure_ascii=False)

    summary_size = summary_path.stat().st_size / 1024  # KB
    print(f"Summary file size: {summary_size:.2f} KB")

    # Print summary statistics
    print("\n" + "=" * 60)
    print("Analysis Complete!")
    print("=" * 60)
    print(f"\nAnalyzed {len(analyses)} texts:")
    for analysis in analyses:
        print(f"  • {analysis['title']}")
        print(f"    - Words: {analysis['word_count']:,}")
        print(f"    - Unique words: {analysis['unique_words']:,}")
        print(f"    - Sentiment (compound): {analysis['sentiment']['vader']['compound']:.4f}")
        print(f"    - Key concepts found: {len(analysis['key_concepts'])}")

    print(f"\n📊 Full analysis: {output_path}")
    print(f"📋 Summary: {summary_path}")
    print(f"\n✓ Ready to visualize in web interface!")


if __name__ == '__main__':
    try:
        main()
    except Exception as e:
        print(f"\n❌ Error during analysis: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc()
        sys.exit(1)
