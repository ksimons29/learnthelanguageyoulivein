import * as dotenv from 'dotenv';
import postgres from 'postgres';

dotenv.config({ path: '.env.local' });

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('DATABASE_URL not set');
  process.exit(1);
}

console.log('Connecting to database...');
const sql = postgres(connectionString);

async function check() {
  // Test the exact query that's failing
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  console.log('Testing with date:', sevenDaysAgo);

  const feedbackStats = await sql`
    SELECT
      COUNT(*) as total_feedback,
      COUNT(CASE WHEN type = 'bug_report' THEN 1 END) as bug_reports,
      COUNT(CASE WHEN type = 'feature_request' THEN 1 END) as feature_requests,
      COUNT(CASE WHEN type = 'general_feedback' THEN 1 END) as general_feedback,
      COUNT(CASE WHEN created_at >= ${sevenDaysAgo}::timestamp THEN 1 END) as feedback_7d
    FROM user_feedback
  `;

  console.log('\nFeedback stats:', feedbackStats[0]);

  await sql.end();
}

check().catch(e => {
  console.error('Error:', e.message);
  process.exit(1);
});
