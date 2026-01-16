import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

/**
 * Database Connection
 *
 * Creates a Drizzle ORM instance connected to Supabase PostgreSQL.
 * Uses the postgres-js driver for optimal performance.
 *
 * Connection is lazy-loaded to allow builds without DATABASE_URL.
 */

let _db: ReturnType<typeof drizzle<typeof schema>> | null = null;

function getConnection() {
  if (_db) {
    return _db;
  }

  // Ensure DATABASE_URL is set at runtime
  if (!process.env.DATABASE_URL) {
    throw new Error(
      'DATABASE_URL environment variable is not set. Please configure it in .env.local'
    );
  }

  // Create postgres connection
  const connectionString = process.env.DATABASE_URL;
  const client = postgres(connectionString, {
    prepare: false, // Required for Supabase
  });

  // Create Drizzle instance with schema
  _db = drizzle(client, { schema });

  return _db;
}

// Export lazy-loaded database connection
export const db = new Proxy({} as ReturnType<typeof drizzle<typeof schema>>, {
  get(_, prop) {
    const connection = getConnection();
    return connection[prop as keyof typeof connection];
  },
});

// Export types for convenience
export type Database = typeof db;
export { schema };
