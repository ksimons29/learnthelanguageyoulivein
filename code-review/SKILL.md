---
name: code-review
description: Perform comprehensive code reviews checking for bugs, security issues, performance problems, and code quality. Use when the user wants code reviewed, needs feedback on their code, or wants to check code quality before merging. Triggers include "review this code", "code review", "check my code", "review PR", "review this PR", "is this code good", "feedback on code".
---

# Code Review

## Core Principles

1. **Constructive**: Suggest improvements, don't just criticize
2. **Prioritized**: Focus on bugs > security > performance > style
3. **Educational**: Explain why, not just what
4. **Actionable**: Every comment should be addressable

## Review Checklist

### 🔴 Critical (Must Fix)

**Bugs**
- Logic errors
- Off-by-one errors
- Null/undefined handling
- Race conditions
- Resource leaks

**Security**
- SQL injection
- XSS vulnerabilities
- Hardcoded secrets
- Improper auth checks
- Sensitive data exposure

### 🟡 Important (Should Fix)

**Performance**
- N+1 queries
- Missing indexes
- Unnecessary loops
- Large memory allocations
- Blocking operations in async code

**Reliability**
- Missing error handling
- Unvalidated inputs
- Missing timeouts
- No retry logic for network calls

### 🟢 Suggestions (Nice to Have)

**Code Quality**
- Unclear naming
- Long functions (>30 lines)
- Deep nesting (>3 levels)
- Code duplication
- Missing types/documentation

## Review Output Format

```markdown
## Code Review: [File/PR Name]

### Summary
[1-2 sentences: Overall assessment]

**Approval Status:** ✅ Approve | 🟡 Approve with comments | ❌ Request changes

---

### 🔴 Critical Issues

**[Location: file:line]**
```[language]
// problematic code
```
**Issue:** [What's wrong]
**Impact:** [What could happen]
**Suggestion:**
```[language]
// suggested fix
```

---

### 🟡 Important Issues

**[Location]**
[Same structure]

---

### 🟢 Suggestions

- **[file:line]**: [Suggestion]
- **[file:line]**: [Suggestion]

---

### 👍 What's Good
- [Positive feedback 1]
- [Positive feedback 2]
```

## Language-Specific Checks

### JavaScript/TypeScript
- Proper async/await usage
- Type safety (TS)
- Event listener cleanup
- Proper error boundaries (React)

### Python
- Type hints present
- Context managers for resources
- Proper exception handling
- No mutable default arguments

### SQL
- Parameterized queries (no string concat)
- Index usage for queries
- Transaction handling
- N+1 query patterns

## Common Patterns to Flag

### Anti-Patterns

```javascript
// ❌ Callback hell
getData(function(a) {
  getMoreData(a, function(b) {
    // ...
  });
});

// ✅ Use async/await
const a = await getData();
const b = await getMoreData(a);
```

```python
# ❌ Mutable default argument
def func(items=[]):
    items.append(1)

# ✅ Use None
def func(items=None):
    items = items or []
```

### Security Red Flags

```javascript
// ❌ SQL injection
query(`SELECT * FROM users WHERE id = ${userId}`)

// ✅ Parameterized query
query('SELECT * FROM users WHERE id = $1', [userId])
```

## Quality Checks

- [ ] All critical issues explained with fix
- [ ] Security issues highlighted prominently
- [ ] Positive feedback included
- [ ] Comments are educational
- [ ] Suggestions are actionable
