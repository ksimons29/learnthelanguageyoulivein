# Bug: Flashcard displays mixed languages (Portuguese with English phrase)

## Environment

* app: production
* url: llyli.vercel.app
* deployment: production
* browser, device, os: iOS Safari (from screenshot)

## Test user and language pair

* email: unknown (user-reported)
* selected pair: Portuguese (pt-PT) / English

## Clean state confirmation

* incognito used: not confirmed
* notebook title verified: not confirmed

## First seen

* date and time: 2026-01-28
* is it new or recurring: unknown

## Steps to reproduce

1. Open Practice tab
2. Review a flashcard that contains the phrase "Take away" / "para levar"
3. Observe the sentence displayed on the card

## Expected

The Portuguese sentence should be entirely in Portuguese:
- "A conta, por favor, e o meu pedido é **para levar**."

## Actual

The Portuguese sentence contains an English phrase mixed in:
- "A conta, por favor, e o meu pedido é **Take away**."

The answer options are also in English ("A water", "A coffee", "Take away") when they should show Portuguese with English translations.

## Frequency

Unknown - needs investigation to determine if this affects other cards

## Evidence

Screenshot attached showing the mixed-language card during practice session.

## Impact

* severity: Medium
* user impact: Confusing learning experience where target language contains source language phrases, undermining the immersion and correctness of the learning content.

## Fix verification performed

* build ran: no
* tests ran: no
* e2e smoke ran: no
* what exact steps you reran: n/a - bug report only
