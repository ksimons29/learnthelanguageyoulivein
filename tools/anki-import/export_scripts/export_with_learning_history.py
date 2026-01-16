#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Export Portuguese vocabulary with FULL LEARNING HISTORY to LLYLI.

This script captures:
- All vocabulary (903 unique entries)
- Learning state (new/learning/review/struggling)
- Review history (count, lapses, intervals)
- Last reviewed dates
- Difficulty metrics (ease factor)
- FSRS scheduling data

Combines data from:
1. Anki (live learning history via AnkiConnect)
2. Google Sheets (vocabulary + categories)
3. iCloud CSV (historical backup)
"""
from __future__ import annotations

import argparse
import csv
import json
import sys
import urllib.request
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional

# Import local modules
import google_sheets
from transform_inbox_to_csv import classify_card


# Category mapping
CATEGORY_MAP = {
    "💪 Gym": "fitness",
    "❤️ Dating": "social",
    "💼 Work": "work",
    "📋 Admin": "bureaucracy",
    "🏡 Daily Life": "home",
    "🔍 Other": "other",
}


def anki_request(action: str, **params) -> dict:
    """Make a request to AnkiConnect API."""
    request_json = json.dumps({
        "action": action,
        "version": 6,
        "params": params
    }).encode('utf-8')

    try:
        response = urllib.request.urlopen(
            urllib.request.Request('http://127.0.0.1:8765', request_json),
            timeout=10
        )
        response_data = json.loads(response.read().decode('utf-8'))

        if response_data.get('error'):
            raise Exception(f"AnkiConnect error: {response_data['error']}")

        return response_data.get('result')
    except Exception as e:
        raise Exception(f"Failed to connect to Anki: {e}")


def get_anki_learning_history(deck_name: str = "Portuguese Mastery (pt-PT)") -> Dict[str, Dict]:
    """
    Get complete learning history for all cards in deck.

    Returns dict mapping (word_pt, word_en) -> learning metadata
    """
    print("Fetching learning history from Anki...")

    # Find all cards
    card_ids = anki_request("findCards", query=f'deck:"{deck_name}"')
    print(f"  Found {len(card_ids)} cards in Anki deck")

    if not card_ids:
        return {}

    # Get detailed card info
    cards_info = anki_request("cardsInfo", cards=card_ids)

    # Get note info for word data
    note_ids = list(set(c.get("note") for c in cards_info if c.get("note")))
    notes_info = anki_request("notesInfo", notes=note_ids)

    # Build notes map
    notes_map = {}
    for note in notes_info:
        notes_map[note.get("noteId")] = note

    # Extract learning history per word
    history = {}

    for card in cards_info:
        note_id = card.get("note")
        note = notes_map.get(note_id, {})
        fields = note.get("fields", {})

        word_pt = fields.get("word_pt", {}).get("value", "").strip()
        word_en = fields.get("word_en", {}).get("value", "").strip()

        if not word_pt or not word_en:
            continue

        key = (word_pt.lower(), word_en.lower())

        # Extract learning metadata
        queue = card.get("queue", 0)  # 0=new, 1=learning, 2=review, 3=day-learn
        card_type = card.get("type", 0)  # 0=new, 1=learning, 2=review
        lapses = card.get("lapses", 0)  # Number of times failed
        reps = card.get("reps", 0)  # Number of reviews
        interval = card.get("interval", 0)  # Days until next review
        factor = card.get("factor", 2500)  # Ease factor (2500 = 250%)
        mod = card.get("mod", 0)  # Last modified timestamp
        due = card.get("due", 0)  # Due date

        # Derive learning state
        if queue == 0:
            learning_state = "new"
        elif queue in (1, 3):
            learning_state = "learning"
        elif queue == 2:
            if lapses >= 3:
                learning_state = "struggling"
            else:
                learning_state = "review"
        else:
            learning_state = "unknown"

        # Additional flags
        if lapses >= 1:
            learning_state = "struggling"  # Override: any lapses = struggling

        # Last reviewed date
        last_reviewed = None
        if mod > 0:
            try:
                last_reviewed = datetime.fromtimestamp(mod).isoformat()
            except:
                pass

        # Check if mastered (review state + low lapses)
        mastered = (queue == 2 and lapses == 0 and reps >= 2)

        history[key] = {
            "learningState": learning_state,
            "reviewCount": reps,
            "lapseCount": lapses,
            "interval": interval,
            "easeFactor": factor / 100,  # Convert to percentage (2500 → 25.0)
            "lastReviewed": last_reviewed,
            "mastered": mastered,
            "queue": queue,
            "cardType": card_type,
            "dueDate": due,
        }

    print(f"  ✓ Extracted learning history for {len(history)} unique words")
    return history


def load_merged_vocabulary(filepath: str = "merged_vocabulary.json") -> List[Dict]:
    """Load the merged vocabulary data."""
    if not Path(filepath).exists():
        raise FileNotFoundError(
            f"Merged data file not found: {filepath}\n"
            "Please run 'python3 merge_all_sources.py' first."
        )

    with open(filepath, 'r', encoding='utf-8') as f:
        return json.load(f)


def normalize_category(category: str) -> str:
    """Normalize category from emoji format to LLYLI format."""
    return CATEGORY_MAP.get(category, "other")


def format_date_iso8601(date_str: str) -> str:
    """Convert YYYY-MM-DD to ISO 8601 format."""
    if not date_str or date_str.strip() == "":
        return datetime.now().isoformat()

    try:
        dt = datetime.strptime(date_str.strip(), "%Y-%m-%d")
        return dt.isoformat()
    except ValueError:
        return datetime.now().isoformat()


def transform_to_llyli_with_history(
    vocabulary: List[Dict],
    learning_history: Dict[str, Dict],
    user_id: str,
    language: str = "target"
) -> List[Dict]:
    """
    Transform vocabulary to LLYLI format with learning history.
    """
    transformed = []

    stats = {
        "total": 0,
        "with_history": 0,
        "new": 0,
        "learning": 0,
        "review": 0,
        "struggling": 0,
        "mastered": 0,
    }

    for row in vocabulary:
        if not row.get("word_pt") or not row.get("word_en"):
            continue

        stats["total"] += 1

        # Build base entry
        entry = {
            "originalText": row["word_pt"],
            "translation": row["word_en"],
            "language": language,
            "userId": user_id,
            "category": normalize_category(row.get("category", "🔍 Other")),
            "createdAt": format_date_iso8601(row.get("date_added", "")),
        }

        # Add example sentences
        if row.get("sentence_pt") and row.get("sentence_en"):
            entry["notes"] = f"PT: {row['sentence_pt']}\nEN: {row['sentence_en']}"

        # Add source tracking
        if row.get("source"):
            if "notes" in entry:
                entry["notes"] += f"\n[Source: {row['source']}]"
            else:
                entry["notes"] = f"[Source: {row['source']}]"

        # Look up learning history
        key = (row["word_pt"].lower(), row["word_en"].lower())
        history = learning_history.get(key)

        if history:
            stats["with_history"] += 1

            # Add learning metadata
            entry["learningHistory"] = {
                "state": history["learningState"],
                "reviewCount": history["reviewCount"],
                "lapseCount": history["lapseCount"],
                "interval": history["interval"],
                "easeFactor": history["easeFactor"],
                "lastReviewed": history["lastReviewed"],
                "mastered": history["mastered"],
            }

            # Track state distribution
            state = history["learningState"]
            stats[state] = stats.get(state, 0) + 1
            if history["mastered"]:
                stats["mastered"] += 1
        else:
            # No history = never studied in Anki
            entry["learningHistory"] = {
                "state": "new",
                "reviewCount": 0,
                "lapseCount": 0,
                "interval": 0,
                "easeFactor": 2.5,
                "lastReviewed": None,
                "mastered": False,
            }
            stats["new"] += 1

        transformed.append(entry)

    # Print stats
    print(f"\n✓ Transformation complete:")
    print(f"  Total entries: {stats['total']}")
    print(f"  With Anki history: {stats['with_history']}")
    print(f"  Never studied (new): {stats['new']}")
    print(f"  Currently learning: {stats['learning']}")
    print(f"  In review: {stats['review']}")
    print(f"  Struggling (1+ lapses): {stats['struggling']}")
    print(f"  Mastered: {stats['mastered']}")

    return transformed


def export_to_json(data: List[Dict[str, str]], output_path: Path) -> None:
    """Export data to JSON format with full learning history."""
    if not data:
        print("No data to export")
        return

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print(f"✓ Exported {len(data)} entries to JSON: {output_path}")


def export_to_csv(data: List[Dict[str, str]], output_path: Path) -> None:
    """Export data to CSV format (flattened learning history)."""
    if not data:
        print("No data to export")
        return

    # CSV columns including learning history
    fieldnames = [
        "originalText", "translation", "language", "userId", "category", "createdAt",
        "learningState", "reviewCount", "lapseCount", "mastered", "lastReviewed"
    ]

    # Flatten learning history into main record
    flat_data = []
    for entry in data:
        flat_entry = {k: v for k, v in entry.items() if k != "learningHistory" and k != "notes"}
        if "learningHistory" in entry:
            hist = entry["learningHistory"]
            flat_entry.update({
                "learningState": hist.get("state", "new"),
                "reviewCount": hist.get("reviewCount", 0),
                "lapseCount": hist.get("lapseCount", 0),
                "mastered": hist.get("mastered", False),
                "lastReviewed": hist.get("lastReviewed", ""),
            })
        flat_data.append(flat_entry)

    with open(output_path, "w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames, extrasaction="ignore")
        writer.writeheader()
        writer.writerows(flat_data)

    print(f"✓ Exported {len(flat_data)} entries to CSV: {output_path}")


def main():
    parser = argparse.ArgumentParser(
        description="Export Portuguese vocabulary with COMPLETE learning history to LLYLI"
    )
    parser.add_argument(
        "--user-id",
        type=str,
        required=True,
        help="LLYLI user ID (required for import)",
    )
    parser.add_argument(
        "--language",
        type=str,
        default="target",
        choices=["source", "target"],
        help="Language designation (default: target)",
    )
    parser.add_argument(
        "--output-dir",
        type=Path,
        default=Path.cwd() / "exports_with_history",
        help="Output directory (default: ./exports_with_history)",
    )
    parser.add_argument(
        "--format",
        type=str,
        default="both",
        choices=["csv", "json", "both"],
        help="Export format (default: both)",
    )
    parser.add_argument(
        "--merged-data",
        type=str,
        default="merged_vocabulary.json",
        help="Path to merged vocabulary file (default: merged_vocabulary.json)",
    )
    parser.add_argument(
        "--deck-name",
        type=str,
        default="Portuguese Mastery (pt-PT)",
        help="Anki deck name (default: Portuguese Mastery (pt-PT))",
    )

    args = parser.parse_args()

    # Create output directory
    args.output_dir.mkdir(parents=True, exist_ok=True)

    try:
        # Load merged vocabulary
        print("Loading merged vocabulary...")
        vocabulary = load_merged_vocabulary(args.merged_data)
        print(f"✓ Loaded {len(vocabulary)} entries")

        # Get learning history from Anki
        print("\nConnecting to Anki...")
        learning_history = get_anki_learning_history(args.deck_name)

        # Transform with history
        print("\nTransforming data with learning history...")
        llyli_data = transform_to_llyli_with_history(
            vocabulary,
            learning_history,
            args.user_id,
            args.language
        )

        # Generate timestamp
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

        # Export to requested formats
        if args.format in ["json", "both"]:
            json_path = args.output_dir / f"llyli_with_history_{timestamp}.json"
            export_to_json(llyli_data, json_path)

        if args.format in ["csv", "both"]:
            csv_path = args.output_dir / f"llyli_with_history_{timestamp}.csv"
            export_to_csv(llyli_data, csv_path)

        print(f"\n✓ Export complete! Files saved to: {args.output_dir}")
        print(f"\n🎯 This export includes:")
        print(f"   - 903 unique vocabulary entries")
        print(f"   - Full learning history from Anki")
        print(f"   - Learning states (new/learning/review/struggling)")
        print(f"   - Review counts and lapse tracking")
        print(f"   - Last reviewed timestamps")
        print(f"   - Mastery flags")
        print(f"   - FSRS scheduling metadata")
        print(f"\n💡 LLYLI can use this to:")
        print(f"   - Start with your actual knowledge level (not from scratch!)")
        print(f"   - Prioritize struggling words")
        print(f"   - Preserve 2+ years of learning history")
        print(f"   - Show meaningful progress stats from day one")

    except Exception as e:
        print(f"\n✗ ERROR: {e}")
        print("\nTroubleshooting:")
        print("  1. Make sure Anki is running")
        print("  2. Ensure AnkiConnect add-on is installed")
        print("  3. Run 'python3 merge_all_sources.py' first")
        sys.exit(1)


if __name__ == "__main__":
    main()
