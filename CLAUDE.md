# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This repository contains a collection of Friedrich Nietzsche's philosophical works sourced from Project Gutenberg. All texts are in English translation and formatted as plain text files.

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

## File Structure

Each text file follows the standard Project Gutenberg format:
- **Header section**: Contains Project Gutenberg license, title, author, translator, release date
- **Marker line**: `*** START OF THE PROJECT GUTENBERG EBOOK [TITLE] ***`
- **Main content**: The actual philosophical text
- **Footer section**: `*** END OF THE PROJECT GUTENBERG EBOOK [TITLE] ***` followed by license details

When analyzing or extracting content, be aware of these structural elements.

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

# Find unique words in a specific text
tr '[:space:]' '\n' < "Nietzsche_Beyond Good and Evil.txt" | tr '[:upper:]' '[:lower:]' | sort | uniq
```

### Extract specific sections
```bash
# Extract content between START and END markers (actual philosophical text only)
sed -n '/\*\*\* START OF THE PROJECT GUTENBERG/,/\*\*\* END OF THE PROJECT GUTENBERG/p' "Nietzsche_Beyond Good and Evil.txt"
```

## Working with the Texts

### Text Encoding
All files are UTF-8 encoded with BOM (Byte Order Mark) at the start.

### Licensing
These texts are from Project Gutenberg and are in the public domain in the United States. The Project Gutenberg License allows free copying, distribution, and reuse with minimal restrictions. Always check local laws regarding public domain status when using outside the US.

### Analysis Considerations
When performing textual analysis or natural language processing:
- Strip Project Gutenberg headers and footers to focus on Nietzsche's actual text
- Be aware that different works have different translators, which may affect word choice and style
- The texts include translator notes, prefaces, and commentary that should be distinguished from Nietzsche's original work
