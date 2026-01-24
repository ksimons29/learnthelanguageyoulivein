#!/usr/bin/env node
require('dotenv').config({ path: '.env.pulled' });
const postgres = require('postgres');

const connectionString = process.env.DATABASE_URL;
const sql = postgres(connectionString, { prepare: false, max: 1 });

async function listTables() {
  console.log('📋 Listing all tables in database:\n');

  const tables = await sql`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
    ORDER BY table_name
  `;

  tables.forEach(t => console.log(`  - ${t.table_name}`));

  await sql.end();
}

listTables().catch(console.error);
