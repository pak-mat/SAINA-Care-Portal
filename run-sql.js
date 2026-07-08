import pkg from 'pg';
const { Client } = pkg;
import fs from 'fs';

async function run() {
  const client = new Client({
    host: 'db.wgwpetvuugupzgychijt.supabase.co',
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: '232811@damt7005'
  });
  try {
    await client.connect();
    const sql = fs.readFileSync('supabase-schema-v3.sql', 'utf8');
    await client.query(sql);
    console.log("SQL execution successful.");
  } catch (err) {
    console.error("SQL execution failed:", err);
  } finally {
    await client.end();
  }
}

run();
