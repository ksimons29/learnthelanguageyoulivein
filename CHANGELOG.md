# Changelog

All notable changes to LLYLI will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **Sentence pre-generation for starter words** - New utility (`lib/sentences/pre-generation.ts`) triggers background sentence generation after onboarding, ensuring users have practice sentences ready immediately
- **Gamification automated tests** - 120+ new unit tests covering:
  - Bingo board winning conditions (rows, columns, diagonals)
  - Streak calculation logic
  - Daily progress state management
  - Consecutive correct tracking
  - Boss Round word selection
  - User persona scenarios (Sofia, Ralf, Maria)
- **Starter vocabulary tests** - 79 tests ensuring gamification readiness:
  - Language coverage for all 6 supported languages
  - Work category verification for bingo squares
  - Boss Round word availability (lapse counts)
  - Translation completeness
- **Work category starter words** - Added to all 6 languages:
  - Portuguese: "Reunião" (meeting), "Prazo" (deadline)
  - Swedish: "Möte" (meeting), "Deadline"
  - Spanish: "Reunión" (meeting), "Plazo" (deadline)
  - French: "Réunion" (meeting), "Délai" (deadline)
  - German: "Besprechung" (meeting), "Frist" (deadline)
  - Dutch: "Vergadering" (meeting), "Deadline"
- **Boss Round ready starter words** - 2 words per language with `initialLapseCount` (2-3) for immediate Boss Round availability
- **Gamification test data seeder** (`scripts/seed-gamification-test-data.ts`):
  - Creates test user with 18 words across 4 categories
  - Pre-configured lapse counts (0-6) for Boss Round testing
  - 5-day streak with 1 freeze available
  - Empty bingo board ready for testing
  - 3 historical Boss Round attempts
- **Gamification API integration tests** (`scripts/test-gamification-api.ts`):
  - Database state verification
  - Gamification state structure checks
  - Boss Round data and selection logic
  - Daily goal completion flow
  - Bingo square completion flow
- **Testing documentation** - Added section 6F-2 to `docs/engineering/TESTING.md`:
  - Automated test commands
  - Test data seeding instructions
  - Manual testing checklist for all bingo squares
  - SQL verification queries

### Changed
- **Starter vocabulary interface** - Added optional `initialLapseCount` field
- **Onboarding starter words API** - Now applies `initialLapseCount` to create Boss Round candidates with realistic FSRS parameters

### Fixed
- New users now have gamification-ready vocabulary from day one
- Work category bingo square can be completed without manually capturing work words
- Boss Round is available immediately for new users (words with lapses exist)

## [0.1.0] - 2025-01-21

### Added
- Initial gamification system:
  - Daily Goals (10 reviews/day default)
  - Streaks with freeze protection
  - 9-square Bingo Board
  - Boss Round challenge
- Core learning features:
  - Phrase capture with AI translation
  - TTS audio generation
  - FSRS spaced repetition
  - Review sessions with mastery tracking
- Notebook browser with categories
- Progress dashboard
- Memory context (personal memory journal)
- PWA offline support
- iOS Capacitor wrapper
