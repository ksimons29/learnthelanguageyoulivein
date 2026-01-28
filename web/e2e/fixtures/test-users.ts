/**
 * Test User Configuration
 *
 * Test accounts for E2E testing. Password should be set via
 * E2E_TEST_PASSWORD environment variable.
 *
 * IMPORTANT: These accounts exist in the production database.
 * Tests should clean up any data they create.
 */

export interface TestUser {
  email: string;
  password: string;
  nativeLanguage: string;
  targetLanguage: string;
  description: string;
}

const TEST_PASSWORD = process.env.E2E_TEST_PASSWORD || 'TestPassword123!';

export const testUsers: Record<string, TestUser> = {
  enPt: {
    email: 'test-en-pt@llyli.test',
    password: TEST_PASSWORD,
    nativeLanguage: 'en',
    targetLanguage: 'pt-PT',
    description: 'English speaker learning European Portuguese',
  },
  enSv: {
    email: 'test-en-sv@llyli.test',
    password: TEST_PASSWORD,
    nativeLanguage: 'en',
    targetLanguage: 'sv',
    description: 'English speaker learning Swedish',
  },
  nlEn: {
    email: 'test-nl-en@llyli.test',
    password: TEST_PASSWORD,
    nativeLanguage: 'nl',
    targetLanguage: 'en',
    description: 'Dutch speaker learning English',
  },
  enNl: {
    email: 'test-en-nl@llyli.test',
    password: TEST_PASSWORD,
    nativeLanguage: 'en',
    targetLanguage: 'nl',
    description: 'English speaker learning Dutch',
  },
};

/**
 * Get default test user (EN→PT)
 */
export function getDefaultTestUser(): TestUser {
  return testUsers.enPt;
}
