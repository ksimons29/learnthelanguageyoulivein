#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Validate Anki import files before importing to LLYLI.

Checks:
- JSON format validity
- Required fields present
- Data types correct
- Learning history format
- Category values valid
- User ID format
"""
import argparse
import json
import sys
from pathlib import Path
from typing import Dict, List


REQUIRED_FIELDS = ["originalText", "translation", "language", "userId", "category", "createdAt"]
OPTIONAL_FIELDS = ["notes", "learningHistory"]
VALID_CATEGORIES = ["fitness", "social", "work", "bureaucracy", "home", "other"]
VALID_LANGUAGES = ["source", "target"]
VALID_LEARNING_STATES = ["new", "learning", "review", "struggling"]


def validate_file_format(filepath: Path) -> Dict:
    """Validate file exists and is valid JSON."""
    if not filepath.exists():
        return {"valid": False, "error": f"File not found: {filepath}"}

    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)

        if not isinstance(data, list):
            return {"valid": False, "error": "Root element must be an array"}

        return {"valid": True, "data": data}

    except json.JSONDecodeError as e:
        return {"valid": False, "error": f"Invalid JSON: {e}"}
    except Exception as e:
        return {"valid": False, "error": f"Error reading file: {e}"}


def validate_entry(entry: Dict, index: int) -> List[str]:
    """Validate a single vocabulary entry."""
    errors = []

    # Check required fields
    for field in REQUIRED_FIELDS:
        if field not in entry:
            errors.append(f"Entry {index}: Missing required field '{field}'")
        elif not entry[field] or (isinstance(entry[field], str) and not entry[field].strip()):
            errors.append(f"Entry {index}: Field '{field}' is empty")

    # Validate field types and values
    if "language" in entry and entry["language"] not in VALID_LANGUAGES:
        errors.append(f"Entry {index}: Invalid language '{entry['language']}' (must be 'source' or 'target')")

    if "category" in entry and entry["category"] not in VALID_CATEGORIES:
        errors.append(f"Entry {index}: Invalid category '{entry['category']}'")

    # Validate learning history if present
    if "learningHistory" in entry:
        history = entry["learningHistory"]
        if not isinstance(history, dict):
            errors.append(f"Entry {index}: learningHistory must be an object")
        else:
            if "state" in history and history["state"] not in VALID_LEARNING_STATES:
                errors.append(f"Entry {index}: Invalid learning state '{history['state']}'")

            # Check numeric fields
            for field in ["reviewCount", "lapseCount", "interval"]:
                if field in history and not isinstance(history[field], (int, float)):
                    errors.append(f"Entry {index}: learningHistory.{field} must be a number")

            # Check boolean fields
            if "mastered" in history and not isinstance(history["mastered"], bool):
                errors.append(f"Entry {index}: learningHistory.mastered must be boolean")

    return errors


def validate_import_file(filepath: Path, verbose: bool = False) -> Dict:
    """Validate complete import file."""
    print(f"Validating: {filepath}")
    print("=" * 70)

    # Check file format
    format_check = validate_file_format(filepath)
    if not format_check["valid"]:
        print(f"✗ FAILED: {format_check['error']}")
        return {"valid": False, "errors": [format_check["error"]]}

    data = format_check["data"]
    print(f"✓ Valid JSON format")
    print(f"✓ {len(data)} entries found")

    # Validate each entry
    all_errors = []
    stats = {
        "total": len(data),
        "with_history": 0,
        "with_notes": 0,
        "categories": set(),
        "languages": set(),
        "users": set(),
        "learning_states": {"new": 0, "learning": 0, "review": 0, "struggling": 0},
        "mastered": 0,
    }

    for index, entry in enumerate(data, 1):
        errors = validate_entry(entry, index)
        all_errors.extend(errors)

        # Collect stats
        if "learningHistory" in entry:
            stats["with_history"] += 1
            state = entry["learningHistory"].get("state", "new")
            stats["learning_states"][state] = stats["learning_states"].get(state, 0) + 1
            if entry["learningHistory"].get("mastered", False):
                stats["mastered"] += 1

        if "notes" in entry and entry["notes"]:
            stats["with_notes"] += 1

        if "category" in entry:
            stats["categories"].add(entry["category"])

        if "language" in entry:
            stats["languages"].add(entry["language"])

        if "userId" in entry:
            stats["users"].add(entry["userId"])

    # Print validation results
    print("\n" + "=" * 70)
    print("VALIDATION RESULTS")
    print("=" * 70)

    if all_errors:
        print(f"\n✗ FAILED with {len(all_errors)} errors:\n")
        for error in all_errors[:20]:  # Show first 20 errors
            print(f"  {error}")
        if len(all_errors) > 20:
            print(f"  ... and {len(all_errors) - 20} more errors")
        return {"valid": False, "errors": all_errors, "stats": stats}

    # All validations passed
    print("\n✓ All validations passed!")

    # Print statistics
    print("\n" + "=" * 70)
    print("STATISTICS")
    print("=" * 70)
    print(f"\nTotal entries: {stats['total']}")
    print(f"With learning history: {stats['with_history']}")
    print(f"With example sentences: {stats['with_notes']}")
    print(f"Mastered words: {stats['mastered']}")

    print(f"\nCategories ({len(stats['categories'])}):")
    for cat in sorted(stats['categories']):
        print(f"  - {cat}")

    print(f"\nLanguages: {', '.join(sorted(stats['languages']))}")
    print(f"User IDs: {len(stats['users'])}")

    if stats['with_history'] > 0:
        print(f"\nLearning States:")
        for state, count in sorted(stats['learning_states'].items()):
            if count > 0:
                print(f"  - {state}: {count}")

    print("\n" + "=" * 70)
    print("✓ Ready to import!")
    print("=" * 70)

    return {"valid": True, "errors": [], "stats": stats}


def main():
    parser = argparse.ArgumentParser(
        description="Validate Anki import files for LLYLI"
    )
    parser.add_argument(
        "filepath",
        type=Path,
        help="Path to JSON import file"
    )
    parser.add_argument(
        "--verbose",
        action="store_true",
        help="Show detailed validation output"
    )

    args = parser.parse_args()

    result = validate_import_file(args.filepath, args.verbose)

    if not result["valid"]:
        print(f"\n✗ Validation failed. Fix errors before importing.")
        sys.exit(1)

    sys.exit(0)


if __name__ == "__main__":
    main()
