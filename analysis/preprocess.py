"""
Text preprocessing module for Nietzsche corpus.
Extracts clean philosophical text from Project Gutenberg files.
"""

import re
import os
from pathlib import Path


def remove_bom(text):
    """Remove UTF-8 BOM if present."""
    if text.startswith('\ufeff'):
        return text[1:]
    return text


def extract_content(text):
    """
    Extract content between Project Gutenberg START and END markers.
    Returns only Nietzsche's philosophical text.
    """
    # Find the START marker
    start_pattern = r'\*\*\* START OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\*]*\*\*\*'
    end_pattern = r'\*\*\* END OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\*]*\*\*\*'

    start_match = re.search(start_pattern, text, re.IGNORECASE)
    end_match = re.search(end_pattern, text, re.IGNORECASE)

    if start_match and end_match:
        # Extract content between markers
        content = text[start_match.end():end_match.start()]
        return content.strip()

    # If markers not found, return original text (fallback)
    print("Warning: Could not find Project Gutenberg markers")
    return text


def clean_text(text):
    """
    Clean extracted text while preserving structure.
    """
    # Remove excessive whitespace while preserving paragraph breaks
    text = re.sub(r'\n{3,}', '\n\n', text)

    # Remove page numbers and other artifacts
    text = re.sub(r'\n\s*\d+\s*\n', '\n', text)

    # Clean up spacing
    text = re.sub(r'[ \t]+', ' ', text)

    return text.strip()


def preprocess_file(filepath):
    """
    Preprocess a single Nietzsche text file.

    Args:
        filepath: Path to the text file

    Returns:
        Cleaned text content
    """
    with open(filepath, 'r', encoding='utf-8') as f:
        text = f.read()

    # Remove BOM
    text = remove_bom(text)

    # Extract content between markers
    text = extract_content(text)

    # Clean the text
    text = clean_text(text)

    return text


def get_text_metadata(filename):
    """Extract metadata from filename."""
    # Remove 'Nietzsche_' prefix and '.txt' suffix
    title = filename.replace('Nietzsche_', '').replace('.txt', '')

    # Create a normalized ID
    text_id = title.lower().replace(' ', '_').replace(',', '')

    return {
        'id': text_id,
        'title': title,
        'filename': filename
    }


def preprocess_all_texts(base_dir='.'):
    """
    Preprocess all Nietzsche text files in the repository.

    Args:
        base_dir: Base directory containing the text files

    Returns:
        Dictionary mapping text IDs to preprocessed content and metadata
    """
    base_path = Path(base_dir)
    texts = {}

    # Find all Nietzsche text files
    text_files = sorted(base_path.glob('Nietzsche_*.txt'))

    print(f"Found {len(text_files)} Nietzsche texts to preprocess...")

    for filepath in text_files:
        filename = filepath.name
        metadata = get_text_metadata(filename)

        print(f"Processing: {metadata['title']}...")

        # Preprocess the text
        clean_content = preprocess_file(filepath)

        # Store with metadata
        texts[metadata['id']] = {
            'metadata': metadata,
            'content': clean_content,
            'char_count': len(clean_content)
        }

        print(f"  Extracted {len(clean_content):,} characters")

    return texts


if __name__ == '__main__':
    # Test preprocessing
    import sys

    base_dir = sys.argv[1] if len(sys.argv) > 1 else '..'

    print("Starting text preprocessing...")
    texts = preprocess_all_texts(base_dir)

    print(f"\nPreprocessing complete!")
    print(f"Total texts processed: {len(texts)}")

    for text_id, data in texts.items():
        print(f"  {data['metadata']['title']}: {data['char_count']:,} chars")
