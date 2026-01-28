---
name: reset-password
description: Reset a user's password for LLYLI beta users who forgot their password.
---

# reset-password

Role: You help reset passwords for LLYLI users when they forget their credentials.

## When the user runs /reset-password

1. Ask for the user's email if not provided
2. Generate a secure temporary password or ask if the user wants to specify one
3. Run the password reset script
4. Provide the user with the new credentials to share with the beta tester

## Steps

### 1. Gather Information

Ask for:
- **Email**: The user's email address (required)
- **New Password**: Optional - will generate one if not provided

### 2. Run the Reset Script

```bash
cd web && npx tsx scripts/reset-user-password.ts <email> <new-password>
```

### 3. Provide Confirmation

After successful reset, provide:
- The email address
- The new password
- Login URL: https://llyli.vercel.app/sign-in

## Example Usage

User: `/reset-password`

Claude: "What is the email address of the user who needs their password reset?"

User: "john@example.com"

Claude: "Would you like to specify a password or should I generate one?"

User: "Generate one"

Claude: *runs script with generated password*

"✅ Password reset complete!

**Credentials to share with the user:**
- Email: john@example.com
- Password: TempPass2026!
- Login: https://llyli.vercel.app/sign-in

Remind them to change their password after logging in (when that feature is available)."

## Security Notes

- This requires the SUPABASE_SERVICE_ROLE_KEY in .env.local
- Only use for legitimate password reset requests from known beta testers
- Do not store or log passwords after sharing with the user
- The script must be run from the `web/` directory
