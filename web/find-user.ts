import { db } from './src/lib/db';
import { words } from './src/lib/db/schema';
import { like, desc } from 'drizzle-orm';

async function findUser() {
  // Find words with 'muito bem' 
  const muitoBem = await db.select()
    .from(words)
    .where(like(words.originalText, '%muito%'))
    .orderBy(desc(words.createdAt))
    .limit(5);
  
  if (muitoBem.length > 0) {
    const userId = muitoBem[0].userId;
    console.log('Found user ID:', userId);
    console.log('Word:', muitoBem[0].originalText);
    console.log('Next review:', muitoBem[0].nextReviewDate);
    
    // Now make all this user words due
    const allUserWords = await db.select().from(words).where(like(words.userId, userId.slice(0, 8) + '%'));
    console.log('\nTotal words for this user:', allUserWords.length);
  }
}

findUser().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
