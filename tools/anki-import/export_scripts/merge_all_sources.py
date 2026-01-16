#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Merge vocabulary from all sources (Google Sheets, Anki, CSV) to create the most complete dataset.
"""
import json
import csv
from pathlib import Path
from typing import Dict, List, Set, Tuple
from datetime import datetime

# Import Google Sheets and classification
import google_sheets
from transform_inbox_to_csv import classify_card


def normalize_key(word_pt: str, word_en: str) -> Tuple[str, str]:
    """Create a normalized key for deduplication."""
    return (
        word_pt.strip().lower() if word_pt else "",
        word_en.strip().lower() if word_en else ""
    )


def load_google_sheets_data() -> List[Dict]:
    """Load data from Google Sheets."""
    print("Loading Google Sheets...")
    storage = google_sheets.GoogleSheetsStorage()
    data = storage.get_all_rows()
    print(f"  ✓ {len(data)} entries from Google Sheets")
    return data


def load_anki_data() -> List[Dict]:
    """Load data from Anki export."""
    print("Loading Anki deck...")
    with open('anki_cards_export.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    print(f"  ✓ {len(data)} cards from Anki deck")
    return data


def load_csv_data() -> List[Dict]:
    """Load data from iCloud CSV file."""
    print("Loading iCloud CSV...")
    csv_path = Path.home() / "Library/Mobile Documents/com~apple~CloudDocs/Portuguese/Anki/sayings.csv"

    data = []
    with open(csv_path, 'r', encoding='utf-8') as f:
        reader = csv.reader(f)
        for row in reader:
            if len(row) >= 5:
                # Format: date,word_pt,word_en,sentence_pt,sentence_en
                data.append({
                    'date_added': row[0].strip(),
                    'word_pt': row[1].strip(),
                    'word_en': row[2].strip(),
                    'sentence_pt': row[3].strip(),
                    'sentence_en': row[4].strip(),
                    'category': '',  # Will classify later
                })

    print(f"  ✓ {len(data)} entries from iCloud CSV")
    return data


def merge_datasets(sheets_data: List[Dict], anki_data: List[Dict], csv_data: List[Dict]) -> List[Dict]:
    """Merge all datasets, preferring Google Sheets for duplicates."""
    print("\nMerging datasets...")

    # Track unique entries by (word_pt, word_en) key
    seen_keys = set()
    merged = []

    # Priority 1: Google Sheets (most recent, has categories)
    for entry in sheets_data:
        key = normalize_key(entry.get('word_pt', ''), entry.get('word_en', ''))
        if key not in seen_keys and key[0] and key[1]:
            seen_keys.add(key)
            merged.append({
                'source': 'Google Sheets',
                'word_pt': entry['word_pt'],
                'word_en': entry['word_en'],
                'sentence_pt': entry.get('sentence_pt', ''),
                'sentence_en': entry.get('sentence_en', ''),
                'date_added': entry.get('date_added', ''),
                'category': entry.get('category', '🔍 Other'),
            })

    # Priority 2: CSV file (older entries that might not be in Sheets)
    csv_added = 0
    for entry in csv_data:
        key = normalize_key(entry.get('word_pt', ''), entry.get('word_en', ''))
        if key not in seen_keys and key[0] and key[1]:
            seen_keys.add(key)
            # Classify the entry
            category = classify_card(
                entry['word_en'],
                entry['word_pt'],
                entry.get('sentence_en', ''),
                entry.get('sentence_pt', '')
            )
            merged.append({
                'source': 'CSV',
                'word_pt': entry['word_pt'],
                'word_en': entry['word_en'],
                'sentence_pt': entry.get('sentence_pt', ''),
                'sentence_en': entry.get('sentence_en', ''),
                'date_added': entry.get('date_added', ''),
                'category': category,
            })
            csv_added += 1

    # Priority 3: Anki deck (current active cards)
    anki_added = 0
    for entry in anki_data:
        key = normalize_key(entry.get('word_pt', ''), entry.get('word_en', ''))
        if key not in seen_keys and key[0] and key[1]:
            seen_keys.add(key)
            # Classify the entry
            category = classify_card(
                entry['word_en'],
                entry['word_pt'],
                entry.get('sentence_en', ''),
                entry.get('sentence_pt', '')
            )
            merged.append({
                'source': 'Anki',
                'word_pt': entry['word_pt'],
                'word_en': entry['word_en'],
                'sentence_pt': entry.get('sentence_pt', ''),
                'sentence_en': entry.get('sentence_en', ''),
                'date_added': entry.get('date_added', ''),
                'category': category,
            })
            anki_added += 1

    print(f"  ✓ Merged {len(merged)} total entries")
    print(f"    - {len(sheets_data)} from Google Sheets")
    print(f"    - {csv_added} additional from CSV")
    print(f"    - {anki_added} additional from Anki")

    return merged


def save_merged_data(data: List[Dict], output_path: str):
    """Save merged data to JSON file."""
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"\n✓ Saved merged data to: {output_path}")


def main():
    print("=" * 70)
    print("MERGING ALL VOCABULARY SOURCES")
    print("=" * 70)
    print()

    # Load all sources
    sheets_data = load_google_sheets_data()
    anki_data = load_anki_data()
    csv_data = load_csv_data()

    # Merge datasets
    merged_data = merge_datasets(sheets_data, anki_data, csv_data)

    # Save merged data
    output_file = "merged_vocabulary.json"
    save_merged_data(merged_data, output_file)

    # Statistics
    print("\n" + "=" * 70)
    print("STATISTICS")
    print("=" * 70)
    print(f"Total unique entries: {len(merged_data)}")

    # Count by source
    from collections import Counter
    source_counts = Counter(entry['source'] for entry in merged_data)
    for source, count in source_counts.items():
        print(f"  - {source}: {count}")

    # Count by category
    category_counts = Counter(entry['category'] for entry in merged_data)
    print(f"\nEntries by category:")
    for category, count in sorted(category_counts.items(), key=lambda x: x[1], reverse=True):
        print(f"  - {category}: {count}")

    print("\n✓ Merge complete!")
    print(f"✓ Use '{output_file}' as input for the most complete export")


if __name__ == "__main__":
    main()
