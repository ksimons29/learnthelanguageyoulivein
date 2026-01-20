/**
 * Generate PowerPoint Presentation for LLYLI Go-Live
 *
 * Creates a professional presentation with screenshots and speaker notes
 * Run with: npx tsx scripts/generate-presentation.ts
 */

import pptxgen from 'pptxgenjs';
import * as fs from 'fs';
import * as path from 'path';

// Brand colors
const COLORS = {
  teal: '0C6B70',
  coral: 'E85C4A',
  cream: 'F5EFE0',
  dark: '1A1A1A',
  muted: '5A6268',
  white: 'FFFFFF',
};

interface Slide {
  title: string;
  subtitle?: string;
  image?: string;
  script: string;
  keyPoints: string[];
}

const slides: Slide[] = [
  {
    title: 'Welcome to LLYLI',
    subtitle: 'Learn the Language You Live In',
    image: '07-sign-up.png',
    script: 'Welcome to LLYLI - Learn the Language You Live In. This app helps you remember real phrases from your daily life. Getting started is simple - just create an account with your email. Your account keeps all your phrases and progress safe in the cloud, so you can access them from any device.',
    keyPoints: [
      'Simple email/password sign-up',
      'Account stores everything securely',
      'Progress synced to the cloud',
    ],
  },
  {
    title: 'Choose Your Target Language',
    subtitle: 'What language fills your days?',
    image: '08-onboarding-language.png',
    script: 'First, tell us what language fills your days - the one you hear on streets, in shops, on signs. This is the language you want to learn.',
    keyPoints: [
      'Select the language you\'re immersed in',
      'Supports: English, Portuguese, Swedish, Spanish, French, German, Dutch',
      'Visual flag selection for easy recognition',
    ],
  },
  {
    title: 'Set Your Native Language',
    subtitle: 'For translations that feel like home',
    image: '09-onboarding-native.png',
    script: 'Next, select your mother tongue. LLYLI will translate everything into this language, so explanations feel like home.',
    keyPoints: [
      'Translations appear in your native language',
      'Creates your personal learning direction',
      'Example: English → Portuguese',
    ],
  },
  {
    title: 'Add Your First Words',
    subtitle: 'Capture phrases you\'ve encountered',
    image: '10-onboarding-capture.png',
    script: 'Now add some words you\'ve already encountered. Seen something on a sign? Heard a phrase at a café? Type it in! The app asks for just 3 words to get started.',
    keyPoints: [
      'Type any word or phrase you\'ve encountered',
      'Minimum 3 words to proceed',
      'Teaches you how to use the capture feature',
    ],
  },
  {
    title: 'Your Notebook is Ready',
    subtitle: 'Essential phrases to get you started',
    image: '11-onboarding-complete.png',
    script: 'Your personal notebook is ready! We\'ve added some essential phrases to help you get started. Tap any phrase to hear it spoken by a native speaker. During reviews, the app will create sentences using YOUR words to help you remember them in context.',
    keyPoints: [
      'Starter phrases pre-loaded',
      'Audio playback for pronunciation',
      'Personalized sentence generation',
    ],
  },
  {
    title: 'Your Daily Dashboard',
    subtitle: 'Everything at a glance',
    image: '01-today-dashboard.png',
    script: 'This is your daily home screen. At a glance, you can see what you captured today, how many phrases are due for review, and your daily progress. The "Capture a Phrase" button is always prominently available.',
    keyPoints: [
      'Quick access to capture and review',
      'Shows phrases captured today',
      'Progress tracking (captured, goal, streak)',
      'Daily Bingo for gamification',
    ],
  },
  {
    title: 'Capturing Phrases',
    subtitle: 'Turn real-life encounters into learning',
    image: '02-capture-page.png',
    script: 'Whenever you encounter a new word or phrase, tap Capture. Type it in - it can be something you saw on a menu, heard in conversation, or read on a sign. The app automatically translates it, categorizes it, and generates native speaker audio.',
    keyPoints: [
      'Type or paste any phrase',
      'Auto-translation and categorization',
      'Native speaker audio generation',
      'Add memory context (where you heard it)',
    ],
  },
  {
    title: 'Review: The Question',
    subtitle: 'Recall the meaning',
    image: '03-review-question.png',
    script: 'When phrases are due for review, tap "Review Due" to start a session. You\'ll see the phrase and hear the audio. Try to recall the meaning before revealing the answer.',
    keyPoints: [
      'Shows progress (1 of 8)',
      'Audio playback available',
      'Simple "Reveal" interaction',
      'FSRS algorithm schedules optimal times',
    ],
  },
  {
    title: 'Review: The Answer',
    subtitle: 'Rate your recall',
    image: '04-review-answer.png',
    script: 'After revealing the answer, rate how well you remembered: Hard, Good, or Easy. This feedback trains the spaced repetition algorithm to show you phrases at exactly the right time - not too soon, not too late.',
    keyPoints: [
      'Three simple recall ratings',
      'FSRS-4.5 algorithm optimizes timing',
      '"3 correct recalls" rule for mastery',
      'Report button for issues',
    ],
  },
  {
    title: 'Your Notebook',
    subtitle: 'Organized phrase collection',
    image: '05-notebook.png',
    script: 'Your Notebook organizes all your phrases by category. See your Inbox for new untagged phrases, or browse by category - Social, Food & Dining, Shopping, Getting Around. The numbers show how many phrases are due for review in each category.',
    keyPoints: [
      'Inbox for organization',
      '8 automatic categories',
      'Search functionality',
      'Due indicators per category',
    ],
  },
  {
    title: 'Track Your Progress',
    subtitle: 'Your learning journey visualized',
    image: '06-progress.png',
    script: 'The Progress page shows your learning journey at a glance. See your total phrases, this week\'s activity, and how many you\'ve mastered. The upcoming calendar shows when reviews are scheduled throughout the week.',
    keyPoints: [
      'Total/weekly/mastered counts',
      'Due today and need practice indicators',
      'Weekly forecast calendar',
      'Quick access to start review',
    ],
  },
  {
    title: 'Daily Usage',
    subtitle: 'Your routine with LLYLI',
    script: 'Here\'s your daily routine with LLYLI:\n\nMorning: Check the Today screen. See what\'s due for review. Do a quick 5-minute review session.\n\nThroughout the day: When you encounter a new word - at a café, in a meeting, on a sign - capture it immediately. Takes 5 seconds.\n\nEvening: Check your progress, review any new due items, browse your notebook.\n\nThe key is consistency: capture real phrases from YOUR life, review them at the right time, and watch your vocabulary grow naturally.',
    keyPoints: [
      'Morning: Review due phrases',
      'Daytime: Capture new encounters',
      'Evening: Check progress',
      'Consistency is key',
    ],
  },
  {
    title: 'The LLYLI Promise',
    subtitle: 'What makes us different',
    script: 'LLYLI offers: Real Phrases - learn words you actually encounter, not textbook vocabulary. Native Audio - hear every phrase spoken correctly. Smart Timing - FSRS algorithm ensures optimal review scheduling. Context Memory - remember where you heard each phrase. Progress Tracking - watch your mastery grow over time. Secure & Synced - your vocabulary is safe in the cloud.',
    keyPoints: [
      'Real phrases from your life',
      'Native speaker audio',
      'FSRS spaced repetition',
      'Cloud-synced and secure',
    ],
  },
];

async function generatePresentation() {
  const pptx = new pptxgen();

  // Set presentation properties
  pptx.author = 'LLYLI';
  pptx.title = 'LLYLI - App Journey';
  pptx.subject = 'Learn the Language You Live In';
  pptx.company = 'LLYLI';

  // Define master slide layout
  pptx.defineSlideMaster({
    title: 'LLYLI_MASTER',
    background: { color: COLORS.cream },
    objects: [
      // Teal header bar
      { rect: { x: 0, y: 0, w: '100%', h: 0.8, fill: { color: COLORS.teal } } },
      // Coral accent line
      { rect: { x: 0, y: 0.8, w: '100%', h: 0.05, fill: { color: COLORS.coral } } },
    ],
  });

  const screenshotsDir = path.join(__dirname, '..', '..', 'docs', 'go-live', 'screenshots');

  for (const slideData of slides) {
    const slide = pptx.addSlide({ masterName: 'LLYLI_MASTER' });

    // Title
    slide.addText(slideData.title, {
      x: 0.5,
      y: 0.15,
      w: '90%',
      h: 0.5,
      fontSize: 24,
      fontFace: 'Arial',
      color: COLORS.white,
      bold: true,
    });

    // Subtitle
    if (slideData.subtitle) {
      slide.addText(slideData.subtitle, {
        x: 0.5,
        y: 1.0,
        w: '90%',
        h: 0.4,
        fontSize: 18,
        fontFace: 'Arial',
        color: COLORS.teal,
        italic: true,
      });
    }

    // Image (if present)
    if (slideData.image) {
      const imagePath = path.join(screenshotsDir, slideData.image);
      if (fs.existsSync(imagePath)) {
        slide.addImage({
          path: imagePath,
          x: 0.5,
          y: 1.5,
          w: 3.5,
          h: 4.5,
          sizing: { type: 'contain', w: 3.5, h: 4.5 },
        });
      }
    }

    // Key points
    const pointsX = slideData.image ? 4.5 : 0.5;
    const pointsY = slideData.image ? 1.5 : 1.8;

    slide.addText('Key Points:', {
      x: pointsX,
      y: pointsY,
      w: 5,
      h: 0.4,
      fontSize: 14,
      fontFace: 'Arial',
      color: COLORS.teal,
      bold: true,
    });

    const bulletPoints = slideData.keyPoints.map(point => ({
      text: point,
      options: { bullet: { type: 'bullet' as const, color: COLORS.coral }, indentLevel: 0 },
    }));

    slide.addText(bulletPoints, {
      x: pointsX,
      y: pointsY + 0.5,
      w: 5,
      h: 3,
      fontSize: 12,
      fontFace: 'Arial',
      color: COLORS.dark,
      valign: 'top',
    });

    // Speaker notes
    slide.addNotes(slideData.script);
  }

  // Save the presentation
  const outputPath = path.join(__dirname, '..', '..', 'docs', 'go-live', 'LLYLI-App-Journey.pptx');
  await pptx.writeFile({ fileName: outputPath });

  console.log(`✅ Presentation saved to: ${outputPath}`);
}

generatePresentation().catch(console.error);
