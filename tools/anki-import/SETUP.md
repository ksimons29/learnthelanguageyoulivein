# Anki Import Setup Guide

Complete setup instructions for importing vocabulary from Anki to LLYLI with full learning history.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Source Project Setup (Anki Side)](#source-project-setup)
3. [LLYLI Setup](#llyli-setup)
4. [Running the Import](#running-the-import)
5. [Verification](#verification)
6. [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Software

- **Python 3.8+**
  ```bash
  python3 --version  # Should show 3.8 or higher
  ```

- **Anki Desktop** with AnkiConnect add-on
  - Download Anki: https://apps.ankiweb.net/
  - Install AnkiConnect: Code `2055492159`
  - Or visit: https://ankiweb.net/shared/info/2055492159

- **Git** (for cloning repositories)

### Optional (for Google Sheets integration)

```bash
pip3 install gspread google-auth
```

## Source Project Setup

### 1. Locate Your Anki Project

Your Anki vocabulary project should have:
- Vocabulary data (words, translations, example sentences)
- Optionally: Google Sheets integration
- Optionally: CSV backup files

Example structure:
```
~/anki-portuguese-sayings/
├── google_sheets.py
├── transform_inbox_to_csv.py
├── artifacts/
│   └── sayings.csv
└── iCloud/...
```

### 2. Install Export Scripts

The export scripts should already be in your Anki project. If not, copy them from this repository:

```bash
# Copy export scripts to your Anki project
cp ~/LLYLI/learnthelanguageyoulivein/tools/anki-import/export_scripts/* \
   ~/path/to/your-anki-project/
```

### 3. Configure AnkiConnect

1. Open Anki
2. Go to Tools → Add-ons
3. Click "Get Add-ons..."
4. Enter code: `2055492159`
5. Restart Anki

Verify it's working:
```bash
curl http://127.0.0.1:8765 -X POST -d '{"action":"version","version":6}'
# Should return: {"result":5,"error":null}
```

### 4. Get Your LLYLI User ID

You'll need your LLYLI user ID for the export. Get it from:
- LLYLI web app: Settings → Account → User ID
- Or authentication token (decode JWT)

Save it for later:
```bash
export LLYLI_USER_ID="your-user-id-here"
```

## LLYLI Setup

### 1. Clone or Update LLYLI Repository

```bash
cd ~/LLYLI
git clone https://github.com/ksimons29/learnthelanguageyoulivein.git
# Or if already cloned:
cd learnthelanguageyoulivein
git pull origin main
```

### 2. Install LLYLI Dependencies

```bash
cd ~/LLYLI/learnthelanguageyoulivein/web
npm install
```

### 3. Set Up Environment Variables

Create `.env.local` in the web directory:

```bash
cd ~/LLYLI/learnthelanguageyoulivein/web
cat > .env.local << 'EOF'
# LLYLI Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000/api
DATABASE_URL=postgresql://user:pass@localhost:5432/llyli
NEXTAUTH_SECRET=your-secret-here
EOF
```

### 4. Start LLYLI Development Server

```bash
cd ~/LLYLI/learnthelanguageyoulivein/web
npm run dev
```

Verify it's running: http://localhost:3000

### 5. Create Import Directory

```bash
cd ~/LLYLI/learnthelanguageyoulivein
mkdir -p tools/anki-import/imports
```

## Running the Import

### Step 1: Export from Anki Project

```bash
# Navigate to your Anki project
cd ~/path/to/your-anki-project

# Make sure Anki is running
open -a Anki
sleep 3

# Step 1: Merge all data sources
python3 merge_all_sources.py
```

Expected output:
```
Loading Google Sheets...
  ✓ 649 entries from Google Sheets
Loading Anki deck...
  ✓ 366 cards from Anki deck
Loading iCloud CSV...
  ✓ 635 entries from iCloud CSV

Merging datasets...
  ✓ Merged 903 total entries
```

```bash
# Step 2: Export with learning history
python3 export_with_learning_history.py \
  --user-id $LLYLI_USER_ID \
  --format json
```

Expected output:
```
Loading merged vocabulary...
✓ Loaded 903 entries

Connecting to Anki...
✓ Found 732 cards in Anki deck
✓ Extracted learning history for 355 unique words

✓ Transformation complete:
  Total entries: 903
  With Anki history: 355
  Mastered: 202

✓ Exported 903 entries to JSON: exports_with_history/llyli_with_history_20260116_HHMMSS.json
```

### Step 2: Copy Export to LLYLI

```bash
# Copy the export file
cp exports_with_history/llyli_with_history_*.json \
   ~/LLYLI/learnthelanguageyoulivein/tools/anki-import/imports/

# Verify the file
ls -lh ~/LLYLI/learnthelanguageyoulivein/tools/anki-import/imports/
```

You should see a JSON file ~500-600KB in size.

### Step 3: Validate Import

```bash
cd ~/LLYLI/learnthelanguageyoulivein

# Validate the import file
python3 tools/anki-import/validate_import.py \
  tools/anki-import/imports/llyli_with_history_*.json
```

Expected output:
```
✓ Valid JSON format
✓ 903 entries found
✓ All required fields present
✓ 355 entries with learning history
✓ 202 mastered words
✓ 6 categories found

Ready to import!
```

### Step 4: Import to LLYLI Database

```bash
# Run the import
python3 tools/anki-import/import_to_llyli.py \
  tools/anki-import/imports/llyli_with_history_*.json \
  --user-id $LLYLI_USER_ID
```

Expected output:
```
Connecting to LLYLI API...
✓ Authenticated as user: your-user-id

Importing 903 entries...
Progress: [████████████████████] 100% (903/903)

✓ Import complete!
  - 903 words imported
  - 355 with learning history
  - 202 mastered words
  - Average: 30 words/second

View your vocabulary at: http://localhost:3000/vocabulary
```

## Verification

### 1. Check LLYLI Web Interface

Open http://localhost:3000/vocabulary and verify:
- [ ] All 903 words are visible
- [ ] Categories are assigned correctly
- [ ] Example sentences are present
- [ ] Learning states are showing (new/learning/review)

### 2. Check Learning History

Navigate to a word that was mastered in Anki:
- [ ] Learning state shows "review" or "mastered"
- [ ] Review count > 0
- [ ] Last reviewed date is present
- [ ] Interval is set

### 3. Run Statistics Query

```bash
# From LLYLI project root
psql $DATABASE_URL -c "
SELECT
  learning_state,
  COUNT(*) as count
FROM vocabulary
WHERE user_id = '$LLYLI_USER_ID'
GROUP BY learning_state;
"
```

Expected output:
```
 learning_state | count
----------------+-------
 new            |   674
 learning       |     4
 review         |   223
 struggling     |     2
```

## Troubleshooting

### Problem: "Cannot connect to Anki"

**Solution:**
```bash
# Check if Anki is running
ps aux | grep -i anki

# Test AnkiConnect
curl http://127.0.0.1:8765 -X POST \
  -d '{"action":"version","version":6}'

# If no response, reinstall AnkiConnect add-on
```

### Problem: "Merged data file not found"

**Solution:**
```bash
# You need to run merge_all_sources.py first
cd ~/path/to/anki-project
python3 merge_all_sources.py

# This creates merged_vocabulary.json
ls -la merged_vocabulary.json
```

### Problem: "Google Sheets credentials not found"

**Solution:**
```bash
# Option 1: Install Google Sheets packages
pip3 install gspread google-auth

# Option 2: Use CSV-only mode
python3 export_with_learning_history.py \
  --user-id $LLYLI_USER_ID \
  --use-csv
```

### Problem: "Invalid user ID"

**Solution:**
```bash
# Get your user ID from LLYLI
# Option 1: Web interface (Settings → Account)
# Option 2: Decode JWT token
# Option 3: Check database directly

psql $DATABASE_URL -c "SELECT id, email FROM users;"
```

### Problem: "Import fails with database error"

**Solution:**
```bash
# Check LLYLI database connection
cd ~/LLYLI/learnthelanguageyoulivein/web
npm run db:check

# Run migrations if needed
npm run db:migrate

# Check environment variables
cat .env.local | grep DATABASE_URL
```

### Problem: "Some words missing after import"

**Solution:**
```bash
# Check validation output for warnings
python3 tools/anki-import/validate_import.py \
  imports/llyli_with_history_*.json \
  --verbose

# Check import logs
tail -100 logs/import_*.log

# Re-run import with --force flag
python3 tools/anki-import/import_to_llyli.py \
  imports/llyli_with_history_*.json \
  --user-id $LLYLI_USER_ID \
  --force
```

## Advanced Options

### Dry Run (Test Without Importing)

```bash
python3 tools/anki-import/import_to_llyli.py \
  imports/llyli_with_history_*.json \
  --user-id $LLYLI_USER_ID \
  --dry-run
```

### Skip Learning History

If you only want words without history:

```bash
python3 tools/anki-import/import_to_llyli.py \
  imports/llyli_with_history_*.json \
  --user-id $LLYLI_USER_ID \
  --skip-history
```

### Batch Import

For large datasets, adjust batch size:

```bash
python3 tools/anki-import/import_to_llyli.py \
  imports/llyli_with_history_*.json \
  --user-id $LLYLI_USER_ID \
  --batch-size 100
```

### Custom API Endpoint

For production imports:

```bash
python3 tools/anki-import/import_to_llyli.py \
  imports/llyli_with_history_*.json \
  --user-id $LLYLI_USER_ID \
  --api-url https://api.llyli.com
```

## Next Steps

After successful import:

1. **Review imported vocabulary** in LLYLI web interface
2. **Check learning states** are correctly assigned
3. **Test spaced repetition** with a few words
4. **Verify example sentences** display properly
5. **Set up study schedule** in LLYLI settings

## Support

For issues or questions:
- Check [ANKI_IMPORT_GUIDE.md](../../docs/engineering/ANKI_IMPORT_GUIDE.md)
- Open GitHub issue with `anki-import` label
- Include validation output and error logs

## Success Checklist

- [ ] Anki is running with AnkiConnect
- [ ] Export scripts installed in Anki project
- [ ] LLYLI user ID obtained
- [ ] LLYLI development server running
- [ ] Data exported from Anki project
- [ ] Export file copied to LLYLI
- [ ] Validation passed
- [ ] Import completed successfully
- [ ] Vocabulary visible in LLYLI web interface
- [ ] Learning history preserved

🎉 Congratulations! Your Anki vocabulary is now in LLYLI with full learning history!
