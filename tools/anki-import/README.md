# Anki Import Tools for LLYLI

This directory contains tools for importing vocabulary data from Anki (or other spaced repetition systems) into LLYLI with full learning history preservation.

## Overview

These tools enable you to:
- ✅ Export complete vocabulary from Anki with learning history
- ✅ Merge data from multiple sources (Anki, Google Sheets, CSV)
- ✅ Preserve learning states (new/learning/review/struggling)
- ✅ Import review counts, lapse tracking, and FSRS metadata
- ✅ Maintain example sentences and context
- ✅ Auto-categorize vocabulary by life domain

## What Gets Imported

Each vocabulary entry includes:

### Required Fields (LLYLI Core)
- `originalText`: Target language phrase (e.g., Portuguese)
- `translation`: Native language translation (e.g., English)
- `language`: "source" or "target"
- `userId`: Your LLYLI user ID
- `category`: Life domain (fitness, social, work, bureaucracy, home, other)
- `createdAt`: ISO 8601 timestamp

### Optional Fields (Enhanced Learning)
- `notes`: Example sentences in both languages
- `learningHistory`: Complete study history from Anki
  - `state`: new | learning | review | struggling
  - `reviewCount`: Number of times studied
  - `lapseCount`: Number of times failed
  - `interval`: Days until next review
  - `easeFactor`: Difficulty multiplier
  - `lastReviewed`: Last study timestamp
  - `mastered`: Boolean flag for fully learned words

## File Structure

```
tools/anki-import/
├── README.md                          # This file
├── SETUP.md                           # Setup instructions
├── export_with_learning_history.py   # Main export script (run from Anki project)
├── import_to_llyli.py                 # Import script (run in LLYLI project)
├── validate_import.py                 # Validation tool
└── examples/
    ├── sample_import.json             # Example import file
    └── sample_import_with_history.json # Example with learning history
```

## Quick Start

### Prerequisites

1. **Source Data**: Anki deck with vocabulary
2. **Python 3.8+**: With packages: `gspread`, `google-auth` (if using Google Sheets)
3. **Anki Running**: For live export via AnkiConnect
4. **LLYLI User ID**: Your authenticated user ID in LLYLI

### Step 1: Export from Anki Project

From your Anki project directory:

```bash
cd ~/path/to/your-anki-project

# Run the merge and export
python3 merge_all_sources.py
python3 export_with_learning_history.py --user-id YOUR_LLYLI_USER_ID
```

This creates: `exports_with_history/llyli_with_history_YYYYMMDD_HHMMSS.json`

### Step 2: Copy Export to LLYLI

```bash
cp exports_with_history/llyli_with_history_*.json \
   ~/LLYLI/learnthelanguageyoulivein/tools/anki-import/imports/
```

### Step 3: Validate Import

```bash
cd ~/LLYLI/learnthelanguageyoulivein
python3 tools/anki-import/validate_import.py \
  tools/anki-import/imports/llyli_with_history_*.json
```

### Step 4: Import to LLYLI

```bash
python3 tools/anki-import/import_to_llyli.py \
  tools/anki-import/imports/llyli_with_history_*.json \
  --user-id YOUR_LLYLI_USER_ID
```

## Data Flow

```
┌─────────────────────┐
│   Anki Deck         │
│  (via AnkiConnect)  │
└──────────┬──────────┘
           │
           ├─► Learning History
           │   (queue, lapses, reviews, intervals)
           │
┌──────────▼──────────┐
│  Google Sheets      │
│  (Categories, etc)  │
└──────────┬──────────┘
           │
┌──────────▼──────────┐
│    iCloud CSV       │
│  (Historical data)  │
└──────────┬──────────┘
           │
           ▼
    [merge_all_sources.py]
           │
           ▼
    merged_vocabulary.json
    (903 unique entries)
           │
           ▼
  [export_with_learning_history.py]
           │
           ▼
  llyli_with_history.json
  (LLYLI-ready format)
           │
           ▼
    [validate_import.py]
           │
           ▼
    [import_to_llyli.py]
           │
           ▼
┌──────────▼──────────┐
│  LLYLI Database     │
│  (Full History!)    │
└─────────────────────┘
```

## Learning History Benefits

### Without Learning History
- All imported words look "new"
- User overwhelmed (where to start with 900 words?)
- Loses years of spaced repetition data
- Can't identify struggling words
- No progress metrics

### With Learning History (This Tool)
- 202 mastered → show less frequently ✅
- 2 struggling → extra practice priority ✅
- 4 learning → daily rotation ✅
- 674 new → introduce gradually ✅
- Smart scheduling from day one! ✅

## Category System

Vocabulary is auto-categorized into life domains:

| Emoji | LLYLI Category | Examples |
|-------|----------------|----------|
| 💪 Gym | fitness | treino, músculo, academia |
| ❤️ Dating | social | jantar, romântico, namorado |
| 💼 Work | work | reunião, projeto, escritório |
| 📋 Admin | bureaucracy | formulário, passaporte, banco |
| 🏡 Daily Life | home | compras, cozinha, dormir |
| 🔍 Other | other | Everything else |

Categories are detected using bilingual keyword matching across all text fields.

## Example Import Data

### Minimal Import (Words Only)
```json
[
  {
    "originalText": "apontado",
    "translation": "pointed",
    "language": "target",
    "userId": "user-123",
    "category": "other",
    "createdAt": "2025-12-15T00:00:00"
  }
]
```

### Full Import (With Learning History)
```json
[
  {
    "originalText": "aludindo",
    "translation": "alluding",
    "language": "target",
    "userId": "user-123",
    "category": "other",
    "createdAt": "2025-12-07T00:00:00",
    "notes": "PT: Ele estava aludindo a um evento passado.\nEN: He was alluding to a past event.",
    "learningHistory": {
      "state": "review",
      "reviewCount": 2,
      "lapseCount": 0,
      "interval": 20,
      "easeFactor": 25.0,
      "lastReviewed": "2026-01-12T12:04:50",
      "mastered": true
    }
  }
]
```

## Troubleshooting

### "Cannot connect to Anki"
- Make sure Anki is running
- Install AnkiConnect add-on: https://ankiweb.net/shared/info/2055492159
- Check AnkiConnect is listening on port 8765

### "Google Sheets credentials not found"
- Install packages: `pip install gspread google-auth`
- Set up credentials: See docs/engineering/ANKI_IMPORT_GUIDE.md
- Or use CSV-only mode with `--use-csv` flag

### "Merged data file not found"
- Run `python3 merge_all_sources.py` first
- This creates `merged_vocabulary.json` needed for export

### "Invalid user ID"
- Get your LLYLI user ID from your authentication token
- Must be a valid authenticated user in LLYLI system

## Advanced Usage

### Export Options

```bash
# Export only CSV format
python3 export_with_learning_history.py \
  --user-id USER_ID \
  --format csv

# Custom output directory
python3 export_with_learning_history.py \
  --user-id USER_ID \
  --output-dir ~/Desktop/exports

# Different deck name
python3 export_with_learning_history.py \
  --user-id USER_ID \
  --deck-name "My Portuguese Deck"
```

### Import Options

```bash
# Dry run (validate without importing)
python3 import_to_llyli.py import.json --dry-run

# Skip learning history
python3 import_to_llyli.py import.json --skip-history

# Batch size
python3 import_to_llyli.py import.json --batch-size 50
```

## API Integration

The import tool uses LLYLI's bulk import API endpoint:

```
POST /api/vocabulary/bulk-import
Content-Type: application/json
Authorization: Bearer <user-token>

{
  "userId": "user-123",
  "entries": [...],
  "preserveHistory": true
}
```

See `import_to_llyli.py` for implementation details.

## Performance

- **Export**: ~5 seconds for 900 words
- **Validation**: ~1 second
- **Import**: ~10-30 seconds (depending on batch size and server)

## Security Notes

- User credentials are never stored in export files
- API calls use Bearer token authentication
- All data transfers use HTTPS in production
- Learning history is private to the user

## Related Documentation

- [ANKI_IMPORT_GUIDE.md](../../docs/engineering/ANKI_IMPORT_GUIDE.md) - Detailed import specification
- [SETUP.md](./SETUP.md) - Detailed setup instructions
- [COMPLETE_EXPORT_SUMMARY.md](../../docs/engineering/COMPLETE_EXPORT_SUMMARY.md) - Export process overview

## Support

Issues or questions? Open an issue in the LLYLI repository with the `anki-import` label.

## License

Same as LLYLI project license.
