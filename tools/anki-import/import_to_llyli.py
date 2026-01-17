#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Import vocabulary from Anki export to LLYLI database.

This script:
1. Loads and validates the import file
2. Authenticates with LLYLI
3. Bulk imports vocabulary with learning history via API
4. Reports progress and results

Usage:
    python3 import_to_llyli.py imports/file.json --user-id YOUR_USER_ID
    python3 import_to_llyli.py imports/file.json --user-id YOUR_USER_ID --dry-run
"""
import argparse
import json
import sys
import time
import urllib.request
import urllib.error
from pathlib import Path
from typing import Dict, List, Optional


def load_import_file(filepath: Path) -> List[Dict]:
    """Load and parse import file."""
    print(f"Loading import file: {filepath}")

    with open(filepath, 'r', encoding='utf-8') as f:
        data = json.load(f)

    if not isinstance(data, list):
        raise ValueError("Import file must contain an array of entries")

    print(f"✓ Loaded {len(data)} entries")
    return data


def get_session_cookie(api_url: str) -> Optional[str]:
    """
    Get session cookie from browser or environment.

    For now, returns None - the API will use the Authorization header.
    In production, this would get the actual session cookie.
    """
    return None


def bulk_import_via_api(
    api_url: str,
    entries: List[Dict],
    auth_cookie: Optional[str] = None,
    batch_size: int = 50,
    dry_run: bool = False
) -> Dict:
    """
    Bulk import vocabulary entries via LLYLI API.

    Sends batched POST requests to /api/words/bulk-import
    """
    print("\nImporting vocabulary...")
    print("=" * 70)

    if dry_run:
        print("DRY RUN MODE - Simulating import")
        return simulate_import(entries, batch_size)

    endpoint = f"{api_url}/words/bulk-import"
    stats = {
        "total": len(entries),
        "imported": 0,
        "withHistory": 0,
        "skipped": 0,
        "errors": 0,
    }

    # Process in batches
    total_batches = (len(entries) + batch_size - 1) // batch_size

    for i in range(0, len(entries), batch_size):
        batch = entries[i:i + batch_size]
        batch_num = (i // batch_size) + 1

        print(f"\nBatch {batch_num}/{total_batches} ({len(batch)} entries)...")

        try:
            # Prepare request
            request_data = json.dumps({
                "entries": batch,
                "skipDuplicates": True
            }).encode('utf-8')

            headers = {
                'Content-Type': 'application/json',
            }
            if auth_cookie:
                headers['Cookie'] = auth_cookie

            req = urllib.request.Request(
                endpoint,
                data=request_data,
                headers=headers,
                method='POST'
            )

            # Send request
            with urllib.request.urlopen(req, timeout=60) as response:
                result = json.loads(response.read().decode('utf-8'))

                if 'data' in result:
                    batch_stats = result['data']
                    stats['imported'] += batch_stats.get('imported', 0)
                    stats['withHistory'] += batch_stats.get('withHistory', 0)
                    stats['skipped'] += batch_stats.get('skipped', 0)
                    stats['errors'] += batch_stats.get('errors', 0) if isinstance(batch_stats.get('errors'), int) else 0

                    print(f"  ✓ Imported: {batch_stats.get('imported', 0)}")
                else:
                    print(f"  ✗ Unexpected response: {result}")
                    stats['errors'] += len(batch)

        except urllib.error.HTTPError as e:
            error_body = e.read().decode('utf-8') if e.fp else str(e)
            print(f"  ✗ HTTP Error {e.code}: {error_body[:200]}")
            stats['errors'] += len(batch)

            if e.code == 401:
                print("\n⚠️  Authentication failed. Make sure you're logged into LLYLI at localhost:3000")
                print("   Then try again - the API will use your browser session.")
                break

        except urllib.error.URLError as e:
            print(f"  ✗ Connection error: {e.reason}")
            print("   Make sure LLYLI is running at localhost:3000")
            stats['errors'] += len(batch)
            break

        except Exception as e:
            print(f"  ✗ Error: {e}")
            stats['errors'] += len(batch)

        # Progress bar
        progress = min(1.0, (i + len(batch)) / len(entries))
        bar_length = 40
        filled = int(bar_length * progress)
        bar = "█" * filled + "░" * (bar_length - filled)
        print(f"Progress: [{bar}] {progress*100:.1f}%")

    print("\n" + "=" * 70)
    return stats


def simulate_import(entries: List[Dict], batch_size: int) -> Dict:
    """Simulate import for dry run."""
    stats = {
        "total": len(entries),
        "imported": 0,
        "withHistory": 0,
        "skipped": 0,
        "errors": 0,
    }

    for i in range(0, len(entries), batch_size):
        batch = entries[i:i + batch_size]
        batch_num = (i // batch_size) + 1
        total_batches = (len(entries) + batch_size - 1) // batch_size

        print(f"Simulating batch {batch_num}/{total_batches}...")

        for entry in batch:
            if entry.get('originalText') and entry.get('translation'):
                stats['imported'] += 1
                if entry.get('learningHistory'):
                    stats['withHistory'] += 1
            else:
                stats['skipped'] += 1

        time.sleep(0.05)  # Small delay to show progress

        progress = (i + len(batch)) / len(entries)
        bar_length = 40
        filled = int(bar_length * progress)
        bar = "█" * filled + "░" * (bar_length - filled)
        print(f"Progress: [{bar}] {progress*100:.1f}%")

    print("\n" + "=" * 70)
    return stats


def print_import_summary(stats: Dict, dry_run: bool = False):
    """Print import summary statistics."""
    print("\nIMPORT SUMMARY")
    print("=" * 70)

    if dry_run:
        print("(DRY RUN - No actual changes made)")

    print(f"\n✓ Total entries:     {stats['total']}")
    print(f"✓ Imported:          {stats['imported']}")

    if stats['withHistory'] > 0:
        print(f"✓ With history:      {stats['withHistory']}")

    if stats['skipped'] > 0:
        print(f"⊘ Skipped:           {stats['skipped']}")

    if stats['errors'] > 0:
        print(f"✗ Errors:            {stats['errors']}")

    # Success rate
    if stats['total'] > 0:
        success_rate = (stats['imported'] / stats['total']) * 100
        print(f"\n📊 Success rate: {success_rate:.1f}%")


def analyze_import_file(entries: List[Dict]) -> Dict:
    """Analyze import file contents."""
    analysis = {
        "total": len(entries),
        "withHistory": 0,
        "byState": {"new": 0, "learning": 0, "review": 0, "struggling": 0},
        "byCategory": {},
        "mastered": 0,
    }

    for entry in entries:
        # Count with history
        if entry.get('learningHistory'):
            analysis['withHistory'] += 1
            history = entry['learningHistory']

            # Count by state
            state = history.get('state', 'new')
            if state in analysis['byState']:
                analysis['byState'][state] += 1

            # Count mastered
            if history.get('mastered'):
                analysis['mastered'] += 1

        # Count by category
        category = entry.get('category', 'other')
        analysis['byCategory'][category] = analysis['byCategory'].get(category, 0) + 1

    return analysis


def print_analysis(analysis: Dict):
    """Print import file analysis."""
    print("\nIMPORT FILE ANALYSIS")
    print("=" * 70)
    print(f"\nTotal entries: {analysis['total']}")
    print(f"With learning history: {analysis['withHistory']}")

    if analysis['withHistory'] > 0:
        print(f"\nBy learning state:")
        for state, count in analysis['byState'].items():
            if count > 0:
                print(f"  {state}: {count}")
        print(f"  Mastered: {analysis['mastered']}")

    print(f"\nBy category:")
    for category, count in sorted(analysis['byCategory'].items(), key=lambda x: -x[1]):
        print(f"  {category}: {count}")


def main():
    parser = argparse.ArgumentParser(
        description="Import Anki vocabulary to LLYLI",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
    # Dry run (no changes)
    python3 import_to_llyli.py imports/file.json --dry-run

    # Actual import (requires being logged into LLYLI)
    python3 import_to_llyli.py imports/file.json

    # Analyze file without importing
    python3 import_to_llyli.py imports/file.json --analyze
        """
    )
    parser.add_argument(
        "filepath",
        type=Path,
        help="Path to JSON import file"
    )
    parser.add_argument(
        "--api-url",
        type=str,
        default="http://localhost:3000/api",
        help="LLYLI API URL (default: http://localhost:3000/api)"
    )
    parser.add_argument(
        "--batch-size",
        type=int,
        default=50,
        help="Batch size for bulk import (default: 50)"
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Simulate import without making changes"
    )
    parser.add_argument(
        "--analyze",
        action="store_true",
        help="Analyze import file and exit"
    )

    args = parser.parse_args()

    # Check file exists
    if not args.filepath.exists():
        print(f"✗ File not found: {args.filepath}")
        sys.exit(1)

    try:
        # Load import file
        entries = load_import_file(args.filepath)

        # Analyze
        analysis = analyze_import_file(entries)
        print_analysis(analysis)

        if args.analyze:
            print("\n✓ Analysis complete. Use without --analyze to import.")
            sys.exit(0)

        # Import
        print("\n" + "=" * 70)
        print("STARTING IMPORT")
        print("=" * 70)

        if not args.dry_run:
            print("\n⚠️  IMPORTANT: Make sure you are logged into LLYLI at localhost:3000")
            print("   The import will use your authenticated browser session.\n")

            response = input("Continue with import? (y/N): ")
            if response.lower() != 'y':
                print("Import cancelled.")
                sys.exit(0)

        start_time = time.time()
        stats = bulk_import_via_api(
            args.api_url,
            entries,
            batch_size=args.batch_size,
            dry_run=args.dry_run
        )
        duration = time.time() - start_time

        # Print summary
        print_import_summary(stats, args.dry_run)
        print(f"\n⏱️  Duration: {duration:.1f} seconds")

        if args.dry_run:
            print("\n✓ Dry run complete. Run without --dry-run to perform actual import.")
        else:
            if stats['imported'] > 0:
                print(f"\n✓ Import complete! View your vocabulary at: http://localhost:3000/vocabulary")
            else:
                print("\n⚠️  No entries imported. Check errors above.")

        sys.exit(0 if stats['errors'] == 0 else 1)

    except KeyboardInterrupt:
        print("\n\nImport cancelled by user.")
        sys.exit(1)
    except Exception as e:
        print(f"\n✗ Import failed: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
