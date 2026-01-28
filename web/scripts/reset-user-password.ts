import { config } from 'dotenv';
config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';

/**
 * Reset a user's password via Supabase Admin API
 *
 * Usage: npx tsx scripts/reset-user-password.ts <email> <new-password>
 *
 * Examples:
 *   npx tsx scripts/reset-user-password.ts user@example.com NewPassword123!
 *   npx tsx scripts/reset-user-password.ts test-en-pt@llyli.test TestPassword123!
 *
 * Requirements:
 *   - SUPABASE_SERVICE_ROLE_KEY in .env.local
 *   - NEXT_PUBLIC_SUPABASE_URL in .env.local
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY is required in .env.local');
  process.exit(1);
}

if (!supabaseUrl) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL is required in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function resetPassword(email: string, newPassword: string) {
  console.log(`\n🔐 Resetting password for ${email}...`);

  // Find user by email
  const { data: users, error: listError } = await supabase.auth.admin.listUsers();

  if (listError) {
    console.error(`❌ Failed to list users: ${listError.message}`);
    process.exit(1);
  }

  const user = users?.users?.find(u => u.email === email);

  if (!user) {
    console.error(`❌ User not found: ${email}`);
    console.log('\nAvailable users:');
    users?.users?.forEach(u => console.log(`  - ${u.email}`));
    process.exit(1);
  }

  // Update password
  const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
    password: newPassword,
    email_confirm: true, // Ensure email is confirmed
  });

  if (updateError) {
    console.error(`❌ Failed to update password: ${updateError.message}`);
    process.exit(1);
  }

  console.log(`✅ Password reset successful!`);
  console.log(`\n   Email: ${email}`);
  console.log(`   New Password: ${newPassword}`);
  console.log(`   User ID: ${user.id}`);
  console.log(`\n   User can now sign in at: https://llyli.vercel.app/sign-in`);
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.log(`
╔═══════════════════════════════════════════════════════════════╗
║  LLYLI Password Reset Tool                                    ║
╠═══════════════════════════════════════════════════════════════╣
║                                                               ║
║  Usage:                                                       ║
║    npx tsx scripts/reset-user-password.ts <email> <password>  ║
║                                                               ║
║  Examples:                                                    ║
║    npx tsx scripts/reset-user-password.ts \\                   ║
║      user@example.com NewPassword123!                         ║
║                                                               ║
║  Password Requirements:                                       ║
║    - At least 8 characters                                    ║
║    - Recommended: uppercase, lowercase, number, symbol        ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
`);
    process.exit(1);
  }

  const [email, newPassword] = args;

  // Basic password validation
  if (newPassword.length < 8) {
    console.error('❌ Password must be at least 8 characters');
    process.exit(1);
  }

  await resetPassword(email, newPassword);
}

main().catch(console.error);
