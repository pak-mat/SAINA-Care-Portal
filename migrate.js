import pkg from 'pg';
import fs from 'fs';

const { Client } = pkg;

const connectionString = 'postgresql://postgres:232811%40damT7005@db.wgwpetvuugupzgychijt.supabase.co:5432/postgres';

async function runMigration() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('Connecting to Supabase PostgreSQL...');
    await client.connect();
    console.log('Connected!');

    console.log('Reading supabase-schema.sql...');
    const sql = fs.readFileSync('supabase-schema.sql', 'utf8');

    console.log('Executing schema script...');
    await client.query(sql);

    console.log('Migration successful!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await client.end();
  }
}

runMigration();
