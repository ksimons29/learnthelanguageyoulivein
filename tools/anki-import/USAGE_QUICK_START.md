# Quick Start: Anki to LLYLI Import

**Time required:** 10-15 minutes
**Prerequisites:** Anki running, Python 3.8+

## TL;DR

```bash
# 1. Export from Anki project (run from your Anki directory)
cd ~/your-anki-project
python3 merge_all_sources.py
python3 export_with_learning_history.py --user-id YOUR_USER_ID

# 2. Copy to LLYLI
cp exports_with_history/llyli_with_history_*.json \
   ~/LLYLI/learnthelanguageyoulivein/tools/anki-import/imports/

# 3. Validate
cd ~/LLYLI/learnthelanguageyoulivein
python3 tools/anki-import/validate_import.py \
  tools/anki-import/imports/llyli_with_history_*.json

# 4. Import
python3 tools/anki-import/import_to_llyli.py \
  tools/anki-import/imports/llyli_with_history_*.json \
  --user-id YOUR_USER_ID
```

## Step-by-Step

### 1. Prepare Anki (One-time setup)

Install AnkiConnect add-on in Anki:
- Open Anki → Tools → Add-ons → Get Add-ons
- Enter code: `2055492159`
- Restart Anki

### 2. Export Your Vocabulary

From your Anki project directory:

```bash
# Make sure Anki is running
open -a Anki
sleep 3

# Merge all sources (Google Sheets, CSV, Anki)
python3 merge_all_sources.py

# Export with learning history
python3 export_with_learning_history.py --user-id YOUR_LLYLI_USER_ID
```

**Expected output:**
```
✓ Loaded 903 entries
✓ Extracted learning history for 355 unique words
✓ Exported to: exports_with_history/llyli_with_history_YYYYMMDD_HHMMSS.json
```

### 3. Move to LLYLI

```bash
cp exports_with_history/llyli_with_history_*.json \
   ~/LLYLI/learnthelanguageyoulivein/tools/anki-import/imports/
```

### 4. Validate

```bash
cd ~/LLYLI/learnthelanguageyoulivein
python3 tools/anki-import/validate_import.py \
  tools/anki-import/imports/llyli_with_history_*.json
```

**Expected output:**
```
✓ Valid JSON format
✓ 903 entries found
✓ All required fields present
✓ Ready to import!
```

### 5. Import

```bash
python3 tools/anki-import/import_to_llyli.py \
  tools/anki-import/imports/llyli_with_history_*.json \
  --user-id YOUR_LLYLI_USER_ID
```

**Expected output:**
```
Progress: [████████████████████] 100% (903/903)
✓ Import complete!
  - 903 words imported
  - 355 with learning history
```

### 6. Verify

Open http://localhost:3000/vocabulary and check:
- [x] All words are visible
- [x] Categories assigned
- [x] Learning states showing (new/learning/review)
- [x] Example sentences preserved

## Common Issues

**"Cannot connect to Anki"**
```bash
# Check Anki is running
ps aux | grep -i anki
# If not, launch it:
open -a Anki
```

**"Merged data file not found"**
```bash
# Run merge step first
python3 merge_all_sources.py
```

**"Invalid user ID"**
- Get your LLYLI user ID from Settings → Account in the web app
- Or check the database: `psql $DATABASE_URL -c "SELECT id FROM users;"`

## What Gets Imported

For each word, you get:
- ✅ Portuguese word + English translation
- ✅ Example sentence (both languages)
- ✅ Category (Gym, Dating, Work, etc.)
- ✅ Learning state (new/learning/review/struggling)
- ✅ Review count (how many times studied)
- ✅ Lapse count (how many times failed)
- ✅ Last reviewed date
- ✅ Mastery flag
- ✅ FSRS scheduling data (interval, ease factor)

## Benefits

**Without learning history:**
- All 900 words look "new"
- Start from scratch
- No progress visibility

**With learning history (this tool):**
- 202 words marked "mastered" → review less frequently
- 2 words "struggling" → extra practice
- 674 words "new" → introduce gradually
- Smart scheduling from day one!

## Advanced Options

**Dry run (test without importing):**
```bash
python3 tools/anki-import/import_to_llyli.py \
  imports/file.json --user-id USER_ID --dry-run
```

**Skip learning history:**
```bash
python3 tools/anki-import/import_to_llyli.py \
  imports/file.json --user-id USER_ID --skip-history
```

**Custom batch size:**
```bash
python3 tools/anki-import/import_to_llyli.py \
  imports/file.json --user-id USER_ID --batch-size 50
```

## Next Steps

After import:
1. Review vocabulary in LLYLI web interface
2. Check learning states are correct
3. Test spaced repetition with a few words
4. Set up study schedule in Settings

## Support

- Full docs: [SETUP.md](./SETUP.md)
- Examples: [examples/](./examples/)
- Issues: Open GitHub issue with `anki-import` label

---

**Success!** Your Anki vocabulary is now in LLYLI with full learning history preserved! 🎉
