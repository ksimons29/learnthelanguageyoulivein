# Apple Reminders MCP Server - Test Scenario

## ✅ Installation Complete

The Apple Reminders MCP server has been successfully:
- **Installed:** `mcp-server-apple-events` (globally via npm)
- **Configured:** Added to `claude_desktop_config.json`
- **Location:** `/opt/homebrew/bin/mcp-server-apple-events`

## 🔄 Required: Restart Claude Desktop

**IMPORTANT:** You MUST completely quit and restart Claude Desktop for the MCP server to load.

### How to Restart Properly:
1. **Quit Claude Desktop completely** (Cmd+Q or Claude menu > Quit Claude)
2. **Wait 3-5 seconds** to ensure the process terminates
3. **Relaunch Claude Desktop** from Applications
4. **Grant permissions** when prompted (Reminders & Calendar access)

## 🧪 Test Scenario

Once you've restarted Claude Desktop and granted permissions, follow these tests:

### Test 1: Check MCP Connection
**Command:** "List all my reminder lists"

**Expected Result:**
- Shows all your Reminders lists including: Daily 5, This Week, Inbox, Opportunities, Build School, CMU / Capstope, Music, Amigos, Sports, Portugal Admin, Routine, Stuff to Buy, Shopping, etc.

**What this tests:** Basic MCP server connectivity and list reading capability

---

### Test 2: Read Daily 5
**Command:** "Show me what's in my Daily 5"

**Expected Result:**
- Lists all items currently in your Daily 5 list
- Shows their completion status
- Shows due dates if any

**What this tests:** Reading reminders from a specific list

---

### Test 3: Read This Week
**Command:** "What's on my This Week list?"

**Expected Result:**
- Shows all items in This Week
- Reports the count (should be ≤15 per your system rules)

**What this tests:** List filtering and counting

---

### Test 4: Check Inbox
**Command:** "Show my Inbox reminders"

**Expected Result:**
- Lists all uncategorized items in Inbox
- These should have no due dates

**What this tests:** Inbox capture list verification

---

### Test 5: Add to Inbox
**Command:** "Add reminder: Draft VibeCode Lisboa pricing page"

**Expected Result:**
- Creates new reminder in Inbox (default capture list)
- No due date assigned
- Confirms creation with list name and title

**What this tests:** Creating new reminders in the default capture location

---

### Test 6: Add to Specific List
**Command:** "Add 'Review CMU chapter 5 exercises' to my CMU / Capstope list"

**Expected Result:**
- Creates reminder in the CMU / Capstope lane backlog
- No due date (lane backlogs shouldn't have dates)
- Confirms creation

**What this tests:** Creating reminders in specific lane backlogs

---

### Test 7: Build Daily 5
**Command:** "Build my Daily 5 for today"

**Expected Result:**
- Reads This Week list
- Selects 5 items following focus rules:
  - 3 VibeCode items (from Build School)
  - 1 Job item (from Opportunities)
  - 1 Capstone or admin item
- Moves them to Daily 5
- Assigns Today date to each
- Shows the final list

**What this tests:** The core workflow of your Daily 5 system

---

### Test 8: Check Today View Sanity
**Command:** "What's on my Today view? Run a sanity check."

**Expected Result:**
- Shows all items with Today date
- Should report: 3 anchors + 5 Daily 5 items = 8 total
- Flags any violations (e.g., items outside Daily 5 with Today dates)

**What this tests:** Date rule enforcement

---

### Test 9: Empty Inbox
**Command:** "Empty my Inbox"

**Expected Result:**
- Reads all Inbox items
- For each item, determines the appropriate lane or This Week
- Moves items and removes any dates
- Reports summary of where items went

**What this tests:** Inbox processing workflow

---

### Test 10: Weekly Build This Week
**Command:** "Build This Week list for the new week"

**Expected Result:**
- Reads all lane backlogs
- Promotes items to This Week:
  - 8-10 VibeCode (from Build School)
  - 3-5 Job (from Opportunities)
  - 2-3 Capstone (from CMU / Capstope)
- Ensures no dates are added
- Reports final count (should be ≤15)

**What this tests:** Weekly planning workflow

---

### Test 11: Get Direction
**Command:** "I feel lost. What should I work on?"

**Expected Result:**
- Checks Daily 5 first
- Shows the first uncompleted item
- If Daily 5 is empty, suggests pulling from This Week
- Biases toward VibeCode items (current priority)

**What this tests:** The "lost user" recovery workflow

---

### Test 12: Search and Update
**Command:** "Find reminders about 'VibeCode pricing' and show me the top matches"

**Expected Result:**
- Searches across all lists
- Shows top 3 matches with IDs
- Asks which one to update (safety rule: never assume)

**What this tests:** Search functionality and update safety rules

---

## 🔍 Verification Checklist

After running the tests, verify:

- [ ] All 12 tests passed without errors
- [ ] MCP tools connect to Apple Reminders
- [ ] Lists are read correctly
- [ ] New reminders are created in the right lists
- [ ] Date rules are enforced (only Daily 5 gets Today dates)
- [ ] Daily 5 workflow (build, select 5, assign dates) works
- [ ] Inbox processing moves items to correct lanes
- [ ] Safety rules prevent accidental deletions
- [ ] Search returns multiple matches and asks for confirmation

## 🐛 Troubleshooting

### If MCP Tools Don't Work:
1. **Restart again:** Quit Claude Desktop completely (Cmd+Q) and relaunch
2. **Check permissions:** Go to System Settings > Privacy & Security > Automation and ensure Claude has access to Reminders
3. **Check config:** Verify `/Users/koossimons/Library/Application Support/Claude/claude_desktop_config.json` has the mcpServers entry
4. **Check logs:** Look for error messages in Claude Desktop console

### If Permissions Are Denied:
1. Go to **System Settings > Privacy & Security > Reminders**
2. Ensure **Claude** is checked
3. Do the same for **Calendar** (needed for the MCP server)
4. Restart Claude Desktop

### If Lists Don't Match:
- The skill assumes specific list names (Daily 5, This Week, Inbox, Build School, etc.)
- If your actual list names differ, either:
  - Rename your lists in Apple Reminders to match
  - Or update the skill's SKILL.md to use your actual list names

## 📊 Success Criteria

The installation is successful if:
1. ✅ MCP server connects without errors
2. ✅ You can read all your reminder lists
3. ✅ You can create new reminders in Inbox
4. ✅ You can build a Daily 5 list with 5 items
5. ✅ Date rules are enforced (only Daily 5 has Today dates)
6. ✅ The skill follows all safety rules (no accidental deletions)

## 🎯 Next Steps After Testing

Once all tests pass:
1. **Use the skill daily** to manage your Daily 5 system
2. **Trigger the skill** with commands like:
   - "Show my daily 5"
   - "Build my daily 5"
   - "Empty my inbox"
   - "What should I work on?"
3. **Provide feedback** if any rules aren't being followed correctly
4. **Adjust the skill** if your list names or workflows differ

---

**Ready to test?** Restart Claude Desktop now and run Test 1!
