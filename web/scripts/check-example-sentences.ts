/**
 * Quick check for example sentences
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import postgres from 'postgres';

const db = postgres(process.env.DATABASE_URL!);

async function main() {
  const result = await db`
    SELECT original_text, translation, example_sentence, example_translation, created_at
    FROM words
    WHERE original_text ILIKE '%padaria%'
    ORDER BY created_at DESC
    LIMIT 5
  `;
  console.log(JSON.stringify(result, null, 2));
  await db.end();
}

main();
