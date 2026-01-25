# LLYLI bug reporting

Purpose: One bug format. One workflow. No drift.

## Non negotiables

1. Production testing is always in a fresh incognito session
2. Before testing, verify you are logged into the intended test user and the notebook title matches that account
3. Any production bug must be reproduced again in a fresh incognito session before filing
4. Any production bug must be tracked as a GitHub issue

## Definition of clean state

Clean state means:

1. Fresh incognito/private window
2. Only one test user signed in
3. Notebook title matches that user
4. Page refreshed once before you start the repro steps

## Severity

1. **Blocker**: cannot sign in, cannot capture, cannot review, data loss, or app unusable
2. **High**: core flow broken but workaround exists
3. **Medium**: incorrect behavior without data loss
4. **Low**: cosmetic or copy issue

## Bug Packet template

### Title

Short and specific

### Environment

* app: production or local
* url:
* deployment: Vercel deployment url or git commit sha
* browser, device, os:

### Test user and language pair

* email:
* selected pair:

### Clean state confirmation

* incognito used: yes or no
* notebook title verified: yes or no

### First seen

* date and time:
* is it new or recurring:

### Steps to reproduce

1.
2.
3.

### Expected

What should happen

### Actual

What happened

### Frequency

always, often, sometimes, once

### Evidence

* screenshot or video
* console errors
* network request and response if relevant
* logs or sql results if relevant

### Impact

* severity:
* user impact in one sentence

### Fix verification performed

* build ran: yes or no
* tests ran: yes or no
* e2e smoke ran: yes or no
* what exact steps you reran:
