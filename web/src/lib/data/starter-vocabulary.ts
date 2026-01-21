/**
 * Starter Vocabulary
 *
 * Pre-curated words given to new users during onboarding.
 * This avoids the "cold start" problem where users have nothing to review.
 *
 * Each target language has 10 common words across varied categories
 * to enable sentence generation from day one.
 */

export interface StarterWord {
  /** Word in the target language */
  text: string;
  /** Category for grouping */
  category: 'social' | 'food_dining' | 'transport' | 'shopping' | 'daily_life' | 'work';
  /** Translations to supported native languages */
  translations: {
    en: string;
    nl: string;
    de: string;
    fr: string;
    sv: string;
    es: string;
    'pt-PT': string;
  };
  /**
   * Initial lapse count for Boss Round testing
   * Words with lapseCount > 0 simulate "struggling" words
   * that need extra practice (used for Boss Round selection)
   */
  initialLapseCount?: number;
}

type TargetLanguage = 'pt-PT' | 'sv' | 'es' | 'fr' | 'de' | 'nl';

export const STARTER_VOCABULARY: Record<TargetLanguage, StarterWord[]> = {
  'pt-PT': [
    {
      text: 'Bom dia',
      category: 'social',
      translations: {
        en: 'Good morning',
        nl: 'Goedemorgen',
        de: 'Guten Morgen',
        fr: 'Bonjour',
        sv: 'God morgon',
        es: 'Buenos días',
        'pt-PT': 'Bom dia',
      },
    },
    {
      text: 'Obrigado',
      category: 'social',
      translations: {
        en: 'Thank you',
        nl: 'Dank je',
        de: 'Danke',
        fr: 'Merci',
        sv: 'Tack',
        es: 'Gracias',
        'pt-PT': 'Obrigado',
      },
    },
    {
      text: 'A conta, por favor',
      category: 'food_dining',
      translations: {
        en: 'The bill, please',
        nl: 'De rekening, alstublieft',
        de: 'Die Rechnung, bitte',
        fr: "L'addition, s'il vous plaît",
        sv: 'Notan, tack',
        es: 'La cuenta, por favor',
        'pt-PT': 'A conta, por favor',
      },
    },
    {
      text: 'Um café',
      category: 'food_dining',
      translations: {
        en: 'A coffee',
        nl: 'Een koffie',
        de: 'Ein Kaffee',
        fr: 'Un café',
        sv: 'En kaffe',
        es: 'Un café',
        'pt-PT': 'Um café',
      },
    },
    {
      text: 'Onde fica...?',
      category: 'transport',
      translations: {
        en: 'Where is...?',
        nl: 'Waar is...?',
        de: 'Wo ist...?',
        fr: 'Où est...?',
        sv: 'Var ligger...?',
        es: '¿Dónde está...?',
        'pt-PT': 'Onde fica...?',
      },
    },
    {
      text: 'À direita',
      category: 'transport',
      translations: {
        en: 'To the right',
        nl: 'Naar rechts',
        de: 'Nach rechts',
        fr: 'À droite',
        sv: 'Till höger',
        es: 'A la derecha',
        'pt-PT': 'À direita',
      },
    },
    {
      text: 'Quanto custa?',
      category: 'shopping',
      translations: {
        en: 'How much does it cost?',
        nl: 'Hoeveel kost het?',
        de: 'Wie viel kostet es?',
        fr: 'Combien ça coûte?',
        sv: 'Hur mycket kostar det?',
        es: '¿Cuánto cuesta?',
        'pt-PT': 'Quanto custa?',
      },
    },
    {
      text: 'Desculpe',
      category: 'social',
      translations: {
        en: 'Excuse me / Sorry',
        nl: 'Pardon / Sorry',
        de: 'Entschuldigung',
        fr: 'Excusez-moi / Pardon',
        sv: 'Ursäkta',
        es: 'Disculpe / Perdón',
        'pt-PT': 'Desculpe',
      },
    },
    {
      text: 'Uma água',
      category: 'food_dining',
      translations: {
        en: 'A water',
        nl: 'Een water',
        de: 'Ein Wasser',
        fr: 'Une eau',
        sv: 'Ett vatten',
        es: 'Un agua',
        'pt-PT': 'Uma água',
      },
    },
    {
      text: 'Até logo',
      category: 'social',
      translations: {
        en: 'See you later',
        nl: 'Tot ziens',
        de: 'Bis später',
        fr: 'À plus tard',
        sv: 'Vi ses',
        es: 'Hasta luego',
        'pt-PT': 'Até logo',
      },
    },
    // Work category words for bingo squares
    {
      text: 'Reunião',
      category: 'work',
      translations: {
        en: 'Meeting',
        nl: 'Vergadering',
        de: 'Besprechung',
        fr: 'Réunion',
        sv: 'Möte',
        es: 'Reunión',
        'pt-PT': 'Reunião',
      },
      initialLapseCount: 2, // Simulates a word user struggles with (Boss Round candidate)
    },
    {
      text: 'Prazo',
      category: 'work',
      translations: {
        en: 'Deadline',
        nl: 'Deadline',
        de: 'Frist',
        fr: 'Délai',
        sv: 'Deadline',
        es: 'Plazo',
        'pt-PT': 'Prazo',
      },
      initialLapseCount: 3, // Higher lapse = higher Boss Round priority
    },
  ],

  sv: [
    {
      text: 'God morgon',
      category: 'social',
      translations: {
        en: 'Good morning',
        nl: 'Goedemorgen',
        de: 'Guten Morgen',
        fr: 'Bonjour',
        sv: 'God morgon',
        es: 'Buenos días',
        'pt-PT': 'Bom dia',
      },
    },
    {
      text: 'Tack',
      category: 'social',
      translations: {
        en: 'Thank you',
        nl: 'Dank je',
        de: 'Danke',
        fr: 'Merci',
        sv: 'Tack',
        es: 'Gracias',
        'pt-PT': 'Obrigado',
      },
    },
    {
      text: 'Notan, tack',
      category: 'food_dining',
      translations: {
        en: 'The bill, please',
        nl: 'De rekening, alstublieft',
        de: 'Die Rechnung, bitte',
        fr: "L'addition, s'il vous plaît",
        sv: 'Notan, tack',
        es: 'La cuenta, por favor',
        'pt-PT': 'A conta, por favor',
      },
    },
    {
      text: 'En kaffe',
      category: 'food_dining',
      translations: {
        en: 'A coffee',
        nl: 'Een koffie',
        de: 'Ein Kaffee',
        fr: 'Un café',
        sv: 'En kaffe',
        es: 'Un café',
        'pt-PT': 'Um café',
      },
    },
    {
      text: 'Var ligger...?',
      category: 'transport',
      translations: {
        en: 'Where is...?',
        nl: 'Waar is...?',
        de: 'Wo ist...?',
        fr: 'Où est...?',
        sv: 'Var ligger...?',
        es: '¿Dónde está...?',
        'pt-PT': 'Onde fica...?',
      },
    },
    {
      text: 'Till höger',
      category: 'transport',
      translations: {
        en: 'To the right',
        nl: 'Naar rechts',
        de: 'Nach rechts',
        fr: 'À droite',
        sv: 'Till höger',
        es: 'A la derecha',
        'pt-PT': 'À direita',
      },
    },
    {
      text: 'Hur mycket kostar det?',
      category: 'shopping',
      translations: {
        en: 'How much does it cost?',
        nl: 'Hoeveel kost het?',
        de: 'Wie viel kostet es?',
        fr: 'Combien ça coûte?',
        sv: 'Hur mycket kostar det?',
        es: '¿Cuánto cuesta?',
        'pt-PT': 'Quanto custa?',
      },
    },
    {
      text: 'Ursäkta',
      category: 'social',
      translations: {
        en: 'Excuse me',
        nl: 'Pardon',
        de: 'Entschuldigung',
        fr: 'Excusez-moi',
        sv: 'Ursäkta',
        es: 'Disculpe',
        'pt-PT': 'Desculpe',
      },
    },
    {
      text: 'Ett vatten',
      category: 'food_dining',
      translations: {
        en: 'A water',
        nl: 'Een water',
        de: 'Ein Wasser',
        fr: 'Une eau',
        sv: 'Ett vatten',
        es: 'Un agua',
        'pt-PT': 'Uma água',
      },
    },
    {
      text: 'Hej då',
      category: 'social',
      translations: {
        en: 'Goodbye',
        nl: 'Tot ziens',
        de: 'Auf Wiedersehen',
        fr: 'Au revoir',
        sv: 'Hej då',
        es: 'Adiós',
        'pt-PT': 'Adeus',
      },
    },
    // Work category words for bingo squares
    {
      text: 'Möte',
      category: 'work',
      translations: {
        en: 'Meeting',
        nl: 'Vergadering',
        de: 'Besprechung',
        fr: 'Réunion',
        sv: 'Möte',
        es: 'Reunión',
        'pt-PT': 'Reunião',
      },
      initialLapseCount: 2,
    },
    {
      text: 'Deadline',
      category: 'work',
      translations: {
        en: 'Deadline',
        nl: 'Deadline',
        de: 'Frist',
        fr: 'Délai',
        sv: 'Deadline',
        es: 'Plazo',
        'pt-PT': 'Prazo',
      },
      initialLapseCount: 3,
    },
  ],

  es: [
    {
      text: 'Buenos días',
      category: 'social',
      translations: {
        en: 'Good morning',
        nl: 'Goedemorgen',
        de: 'Guten Morgen',
        fr: 'Bonjour',
        sv: 'God morgon',
        es: 'Buenos días',
        'pt-PT': 'Bom dia',
      },
    },
    {
      text: 'Gracias',
      category: 'social',
      translations: {
        en: 'Thank you',
        nl: 'Dank je',
        de: 'Danke',
        fr: 'Merci',
        sv: 'Tack',
        es: 'Gracias',
        'pt-PT': 'Obrigado',
      },
    },
    {
      text: 'La cuenta, por favor',
      category: 'food_dining',
      translations: {
        en: 'The bill, please',
        nl: 'De rekening, alstublieft',
        de: 'Die Rechnung, bitte',
        fr: "L'addition, s'il vous plaît",
        sv: 'Notan, tack',
        es: 'La cuenta, por favor',
        'pt-PT': 'A conta, por favor',
      },
    },
    {
      text: 'Un café',
      category: 'food_dining',
      translations: {
        en: 'A coffee',
        nl: 'Een koffie',
        de: 'Ein Kaffee',
        fr: 'Un café',
        sv: 'En kaffe',
        es: 'Un café',
        'pt-PT': 'Um café',
      },
    },
    {
      text: '¿Dónde está...?',
      category: 'transport',
      translations: {
        en: 'Where is...?',
        nl: 'Waar is...?',
        de: 'Wo ist...?',
        fr: 'Où est...?',
        sv: 'Var ligger...?',
        es: '¿Dónde está...?',
        'pt-PT': 'Onde fica...?',
      },
    },
    {
      text: 'A la derecha',
      category: 'transport',
      translations: {
        en: 'To the right',
        nl: 'Naar rechts',
        de: 'Nach rechts',
        fr: 'À droite',
        sv: 'Till höger',
        es: 'A la derecha',
        'pt-PT': 'À direita',
      },
    },
    {
      text: '¿Cuánto cuesta?',
      category: 'shopping',
      translations: {
        en: 'How much does it cost?',
        nl: 'Hoeveel kost het?',
        de: 'Wie viel kostet es?',
        fr: 'Combien ça coûte?',
        sv: 'Hur mycket kostar det?',
        es: '¿Cuánto cuesta?',
        'pt-PT': 'Quanto custa?',
      },
    },
    {
      text: 'Perdón',
      category: 'social',
      translations: {
        en: 'Excuse me / Sorry',
        nl: 'Pardon / Sorry',
        de: 'Entschuldigung',
        fr: 'Pardon',
        sv: 'Ursäkta',
        es: 'Perdón',
        'pt-PT': 'Desculpe',
      },
    },
    {
      text: 'Un agua',
      category: 'food_dining',
      translations: {
        en: 'A water',
        nl: 'Een water',
        de: 'Ein Wasser',
        fr: 'Une eau',
        sv: 'Ett vatten',
        es: 'Un agua',
        'pt-PT': 'Uma água',
      },
    },
    {
      text: 'Hasta luego',
      category: 'social',
      translations: {
        en: 'See you later',
        nl: 'Tot ziens',
        de: 'Bis später',
        fr: 'À plus tard',
        sv: 'Vi ses',
        es: 'Hasta luego',
        'pt-PT': 'Até logo',
      },
    },
    // Work category words for bingo squares
    {
      text: 'Reunión',
      category: 'work',
      translations: {
        en: 'Meeting',
        nl: 'Vergadering',
        de: 'Besprechung',
        fr: 'Réunion',
        sv: 'Möte',
        es: 'Reunión',
        'pt-PT': 'Reunião',
      },
      initialLapseCount: 2,
    },
    {
      text: 'Plazo',
      category: 'work',
      translations: {
        en: 'Deadline',
        nl: 'Deadline',
        de: 'Frist',
        fr: 'Délai',
        sv: 'Deadline',
        es: 'Plazo',
        'pt-PT': 'Prazo',
      },
      initialLapseCount: 3,
    },
  ],

  fr: [
    {
      text: 'Bonjour',
      category: 'social',
      translations: {
        en: 'Good morning / Hello',
        nl: 'Goedemorgen / Hallo',
        de: 'Guten Tag / Hallo',
        fr: 'Bonjour',
        sv: 'God dag / Hej',
        es: 'Buenos días / Hola',
        'pt-PT': 'Bom dia / Olá',
      },
    },
    {
      text: 'Merci',
      category: 'social',
      translations: {
        en: 'Thank you',
        nl: 'Dank je',
        de: 'Danke',
        fr: 'Merci',
        sv: 'Tack',
        es: 'Gracias',
        'pt-PT': 'Obrigado',
      },
    },
    {
      text: "L'addition, s'il vous plaît",
      category: 'food_dining',
      translations: {
        en: 'The bill, please',
        nl: 'De rekening, alstublieft',
        de: 'Die Rechnung, bitte',
        fr: "L'addition, s'il vous plaît",
        sv: 'Notan, tack',
        es: 'La cuenta, por favor',
        'pt-PT': 'A conta, por favor',
      },
    },
    {
      text: 'Un café',
      category: 'food_dining',
      translations: {
        en: 'A coffee',
        nl: 'Een koffie',
        de: 'Ein Kaffee',
        fr: 'Un café',
        sv: 'En kaffe',
        es: 'Un café',
        'pt-PT': 'Um café',
      },
    },
    {
      text: 'Où est...?',
      category: 'transport',
      translations: {
        en: 'Where is...?',
        nl: 'Waar is...?',
        de: 'Wo ist...?',
        fr: 'Où est...?',
        sv: 'Var ligger...?',
        es: '¿Dónde está...?',
        'pt-PT': 'Onde fica...?',
      },
    },
    {
      text: 'À droite',
      category: 'transport',
      translations: {
        en: 'To the right',
        nl: 'Naar rechts',
        de: 'Nach rechts',
        fr: 'À droite',
        sv: 'Till höger',
        es: 'A la derecha',
        'pt-PT': 'À direita',
      },
    },
    {
      text: 'Combien ça coûte?',
      category: 'shopping',
      translations: {
        en: 'How much does it cost?',
        nl: 'Hoeveel kost het?',
        de: 'Wie viel kostet es?',
        fr: 'Combien ça coûte?',
        sv: 'Hur mycket kostar det?',
        es: '¿Cuánto cuesta?',
        'pt-PT': 'Quanto custa?',
      },
    },
    {
      text: 'Excusez-moi',
      category: 'social',
      translations: {
        en: 'Excuse me',
        nl: 'Pardon',
        de: 'Entschuldigung',
        fr: 'Excusez-moi',
        sv: 'Ursäkta',
        es: 'Disculpe',
        'pt-PT': 'Desculpe',
      },
    },
    {
      text: 'Une eau',
      category: 'food_dining',
      translations: {
        en: 'A water',
        nl: 'Een water',
        de: 'Ein Wasser',
        fr: 'Une eau',
        sv: 'Ett vatten',
        es: 'Un agua',
        'pt-PT': 'Uma água',
      },
    },
    {
      text: 'Au revoir',
      category: 'social',
      translations: {
        en: 'Goodbye',
        nl: 'Tot ziens',
        de: 'Auf Wiedersehen',
        fr: 'Au revoir',
        sv: 'Hej då',
        es: 'Adiós',
        'pt-PT': 'Adeus',
      },
    },
    // Work category words for bingo squares
    {
      text: 'Réunion',
      category: 'work',
      translations: {
        en: 'Meeting',
        nl: 'Vergadering',
        de: 'Besprechung',
        fr: 'Réunion',
        sv: 'Möte',
        es: 'Reunión',
        'pt-PT': 'Reunião',
      },
      initialLapseCount: 2,
    },
    {
      text: 'Délai',
      category: 'work',
      translations: {
        en: 'Deadline',
        nl: 'Deadline',
        de: 'Frist',
        fr: 'Délai',
        sv: 'Deadline',
        es: 'Plazo',
        'pt-PT': 'Prazo',
      },
      initialLapseCount: 3,
    },
  ],

  de: [
    {
      text: 'Guten Tag',
      category: 'social',
      translations: {
        en: 'Good day / Hello',
        nl: 'Goedendag',
        de: 'Guten Tag',
        fr: 'Bonjour',
        sv: 'God dag',
        es: 'Buenos días',
        'pt-PT': 'Bom dia',
      },
    },
    {
      text: 'Danke',
      category: 'social',
      translations: {
        en: 'Thank you',
        nl: 'Dank je',
        de: 'Danke',
        fr: 'Merci',
        sv: 'Tack',
        es: 'Gracias',
        'pt-PT': 'Obrigado',
      },
    },
    {
      text: 'Die Rechnung, bitte',
      category: 'food_dining',
      translations: {
        en: 'The bill, please',
        nl: 'De rekening, alstublieft',
        de: 'Die Rechnung, bitte',
        fr: "L'addition, s'il vous plaît",
        sv: 'Notan, tack',
        es: 'La cuenta, por favor',
        'pt-PT': 'A conta, por favor',
      },
    },
    {
      text: 'Einen Kaffee',
      category: 'food_dining',
      translations: {
        en: 'A coffee',
        nl: 'Een koffie',
        de: 'Einen Kaffee',
        fr: 'Un café',
        sv: 'En kaffe',
        es: 'Un café',
        'pt-PT': 'Um café',
      },
    },
    {
      text: 'Wo ist...?',
      category: 'transport',
      translations: {
        en: 'Where is...?',
        nl: 'Waar is...?',
        de: 'Wo ist...?',
        fr: 'Où est...?',
        sv: 'Var ligger...?',
        es: '¿Dónde está...?',
        'pt-PT': 'Onde fica...?',
      },
    },
    {
      text: 'Nach rechts',
      category: 'transport',
      translations: {
        en: 'To the right',
        nl: 'Naar rechts',
        de: 'Nach rechts',
        fr: 'À droite',
        sv: 'Till höger',
        es: 'A la derecha',
        'pt-PT': 'À direita',
      },
    },
    {
      text: 'Wie viel kostet das?',
      category: 'shopping',
      translations: {
        en: 'How much does this cost?',
        nl: 'Hoeveel kost dit?',
        de: 'Wie viel kostet das?',
        fr: 'Combien ça coûte?',
        sv: 'Hur mycket kostar det?',
        es: '¿Cuánto cuesta?',
        'pt-PT': 'Quanto custa?',
      },
    },
    {
      text: 'Entschuldigung',
      category: 'social',
      translations: {
        en: 'Excuse me / Sorry',
        nl: 'Pardon / Sorry',
        de: 'Entschuldigung',
        fr: 'Excusez-moi / Pardon',
        sv: 'Ursäkta',
        es: 'Perdón',
        'pt-PT': 'Desculpe',
      },
    },
    {
      text: 'Ein Wasser',
      category: 'food_dining',
      translations: {
        en: 'A water',
        nl: 'Een water',
        de: 'Ein Wasser',
        fr: 'Une eau',
        sv: 'Ett vatten',
        es: 'Un agua',
        'pt-PT': 'Uma água',
      },
    },
    {
      text: 'Auf Wiedersehen',
      category: 'social',
      translations: {
        en: 'Goodbye',
        nl: 'Tot ziens',
        de: 'Auf Wiedersehen',
        fr: 'Au revoir',
        sv: 'Hej då',
        es: 'Adiós',
        'pt-PT': 'Adeus',
      },
    },
    // Work category words for bingo squares
    {
      text: 'Besprechung',
      category: 'work',
      translations: {
        en: 'Meeting',
        nl: 'Vergadering',
        de: 'Besprechung',
        fr: 'Réunion',
        sv: 'Möte',
        es: 'Reunión',
        'pt-PT': 'Reunião',
      },
      initialLapseCount: 2,
    },
    {
      text: 'Frist',
      category: 'work',
      translations: {
        en: 'Deadline',
        nl: 'Deadline',
        de: 'Frist',
        fr: 'Délai',
        sv: 'Deadline',
        es: 'Plazo',
        'pt-PT': 'Prazo',
      },
      initialLapseCount: 3,
    },
  ],

  nl: [
    {
      text: 'Goedemorgen',
      category: 'social',
      translations: {
        en: 'Good morning',
        nl: 'Goedemorgen',
        de: 'Guten Morgen',
        fr: 'Bonjour',
        sv: 'God morgon',
        es: 'Buenos días',
        'pt-PT': 'Bom dia',
      },
    },
    {
      text: 'Dank je wel',
      category: 'social',
      translations: {
        en: 'Thank you',
        nl: 'Dank je wel',
        de: 'Danke',
        fr: 'Merci',
        sv: 'Tack',
        es: 'Gracias',
        'pt-PT': 'Obrigado',
      },
    },
    {
      text: 'De rekening, alstublieft',
      category: 'food_dining',
      translations: {
        en: 'The bill, please',
        nl: 'De rekening, alstublieft',
        de: 'Die Rechnung, bitte',
        fr: "L'addition, s'il vous plaît",
        sv: 'Notan, tack',
        es: 'La cuenta, por favor',
        'pt-PT': 'A conta, por favor',
      },
    },
    {
      text: 'Een koffie',
      category: 'food_dining',
      translations: {
        en: 'A coffee',
        nl: 'Een koffie',
        de: 'Ein Kaffee',
        fr: 'Un café',
        sv: 'En kaffe',
        es: 'Un café',
        'pt-PT': 'Um café',
      },
    },
    {
      text: 'Waar is...?',
      category: 'transport',
      translations: {
        en: 'Where is...?',
        nl: 'Waar is...?',
        de: 'Wo ist...?',
        fr: 'Où est...?',
        sv: 'Var ligger...?',
        es: '¿Dónde está...?',
        'pt-PT': 'Onde fica...?',
      },
    },
    {
      text: 'Naar rechts',
      category: 'transport',
      translations: {
        en: 'To the right',
        nl: 'Naar rechts',
        de: 'Nach rechts',
        fr: 'À droite',
        sv: 'Till höger',
        es: 'A la derecha',
        'pt-PT': 'À direita',
      },
    },
    {
      text: 'Hoeveel kost het?',
      category: 'shopping',
      translations: {
        en: 'How much does it cost?',
        nl: 'Hoeveel kost het?',
        de: 'Wie viel kostet es?',
        fr: 'Combien ça coûte?',
        sv: 'Hur mycket kostar det?',
        es: '¿Cuánto cuesta?',
        'pt-PT': 'Quanto custa?',
      },
    },
    {
      text: 'Sorry',
      category: 'social',
      translations: {
        en: 'Sorry',
        nl: 'Sorry',
        de: 'Entschuldigung',
        fr: 'Pardon',
        sv: 'Förlåt',
        es: 'Perdón',
        'pt-PT': 'Desculpe',
      },
    },
    {
      text: 'Een water',
      category: 'food_dining',
      translations: {
        en: 'A water',
        nl: 'Een water',
        de: 'Ein Wasser',
        fr: 'Une eau',
        sv: 'Ett vatten',
        es: 'Un agua',
        'pt-PT': 'Uma água',
      },
    },
    {
      text: 'Tot ziens',
      category: 'social',
      translations: {
        en: 'Goodbye',
        nl: 'Tot ziens',
        de: 'Auf Wiedersehen',
        fr: 'Au revoir',
        sv: 'Hej då',
        es: 'Adiós',
        'pt-PT': 'Adeus',
      },
    },
    // Work category words for bingo squares
    {
      text: 'Vergadering',
      category: 'work',
      translations: {
        en: 'Meeting',
        nl: 'Vergadering',
        de: 'Besprechung',
        fr: 'Réunion',
        sv: 'Möte',
        es: 'Reunión',
        'pt-PT': 'Reunião',
      },
      initialLapseCount: 2,
    },
    {
      text: 'Deadline',
      category: 'work',
      translations: {
        en: 'Deadline',
        nl: 'Deadline',
        de: 'Frist',
        fr: 'Délai',
        sv: 'Deadline',
        es: 'Plazo',
        'pt-PT': 'Prazo',
      },
      initialLapseCount: 3,
    },
  ],
};

/**
 * Get starter words for a target language
 */
export function getStarterWords(targetLanguage: string): StarterWord[] | undefined {
  return STARTER_VOCABULARY[targetLanguage as TargetLanguage];
}

/**
 * Get translation for a starter word in a specific native language
 */
export function getTranslation(
  word: StarterWord,
  nativeLanguage: string
): string {
  const lang = nativeLanguage as keyof StarterWord['translations'];
  return word.translations[lang] || word.translations.en;
}
