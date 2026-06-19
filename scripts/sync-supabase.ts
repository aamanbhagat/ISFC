/**
 * sync-supabase — load the RBI/razorpay IFSC dataset into Supabase (Postgres).
 *
 * Idempotent. Run quarterly after a new razorpay/ifsc release:
 *
 *   1. Download the dataset (CSV or a JSON array of records) from the latest
 *      release: https://github.com/razorpay/ifsc/releases
 *   2. Point the script at it and run:
 *
 *        IFSC_DATASET_URL=/path/to/IFSC.csv npm run sync
 *
 * Requires SUPABASE_DB_URL (Postgres connection string) in .env.local.
 */
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import postgres from 'postgres';
import { normalizeRaw } from '../lib/ifsc';
import type { BranchRow, RawBranch } from '../types/ifsc';

const SRC = process.env.IFSC_DATASET_URL;
const DB_URL = process.env.SUPABASE_DB_URL;
const BATCH = 2000;

function die(msg: string): never {
  console.error(`\n✖ ${msg}\n`);
  process.exit(1);
}

// ── Source loading ───────────────────────────────────────────
async function loadSource(): Promise<RawBranch[]> {
  if (!SRC) {
    die(
      'Set IFSC_DATASET_URL to a CSV or JSON dataset path/URL.\n' +
        '  Download from https://github.com/razorpay/ifsc/releases',
    );
  }
  let text: string;
  if (existsSync(SRC)) {
    text = await readFile(SRC, 'utf8');
  } else {
    const res = await fetch(SRC);
    if (!res.ok) die(`Failed to fetch dataset: ${res.status} ${res.statusText}`);
    text = await res.text();
  }
  const trimmed = text.trimStart();
  return trimmed.startsWith('[') ? parseJson(trimmed) : parseCsv(text);
}

function parseJson(text: string): RawBranch[] {
  const arr = JSON.parse(text) as Record<string, unknown>[];
  return arr.map(coerce);
}

// Minimal RFC-4180-ish CSV parser (handles quoted fields and embedded commas).
function parseCsv(text: string): RawBranch[] {
  const rows: string[][] = [];
  let field = '';
  let row: string[] = [];
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else inQuotes = false;
      } else field += c;
    } else if (c === '"') inQuotes = true;
    else if (c === ',') {
      row.push(field);
      field = '';
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(field);
      field = '';
      if (row.some((v) => v.length)) rows.push(row);
      row = [];
    } else field += c;
  }
  if (field.length || row.length) {
    row.push(field);
    rows.push(row);
  }
  const header = rows.shift()?.map((h) => h.trim().toUpperCase()) ?? [];
  return rows.map((cols) => {
    const rec: Record<string, unknown> = {};
    header.forEach((h, i) => (rec[h] = cols[i]));
    return coerce(rec);
  });
}

function bool(v: unknown): boolean {
  const s = String(v ?? '').trim().toLowerCase();
  return s === 'true' || s === '1' || s === 'yes';
}
function str(v: unknown): string {
  return String(v ?? '').trim();
}
function nstr(v: unknown): string | null {
  const s = str(v);
  return s ? s : null;
}

function coerce(rec: Record<string, unknown>): RawBranch {
  return {
    IFSC: str(rec.IFSC),
    BANK: str(rec.BANK),
    BANKCODE: str(rec.BANKCODE) || str(rec.IFSC).slice(0, 4),
    BRANCH: str(rec.BRANCH),
    CENTRE: str(rec.CENTRE),
    DISTRICT: str(rec.DISTRICT),
    STATE: str(rec.STATE),
    CITY: str(rec.CITY),
    ADDRESS: str(rec.ADDRESS),
    CONTACT: nstr(rec.CONTACT),
    MICR: nstr(rec.MICR),
    SWIFT: nstr(rec.SWIFT),
    ISO3166: nstr(rec.ISO3166),
    UPI: bool(rec.UPI),
    IMPS: bool(rec.IMPS),
    RTGS: bool(rec.RTGS),
    NEFT: bool(rec.NEFT),
  };
}

// ── Schema (Postgres) ────────────────────────────────────────
const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS branches (
     ifsc TEXT PRIMARY KEY, bank_code TEXT, bank_name TEXT, bank_slug TEXT,
     branch TEXT, centre TEXT, district TEXT, state TEXT, state_slug TEXT,
     city TEXT, city_slug TEXT, address TEXT, contact TEXT, micr TEXT,
     swift TEXT, iso3166 TEXT, upi SMALLINT, imps SMALLINT, rtgs SMALLINT,
     neft SMALLINT, updated_at TEXT
   )`,
  `CREATE TABLE IF NOT EXISTS banks (
     slug TEXT PRIMARY KEY, code TEXT, name TEXT, branch_count INTEGER, updated_at TEXT
   )`,
];

const INDEXES = [
  `CREATE INDEX IF NOT EXISTS idx_branches_bank ON branches(bank_slug)`,
  `CREATE INDEX IF NOT EXISTS idx_branches_bank_state ON branches(bank_slug, state_slug)`,
  `CREATE INDEX IF NOT EXISTS idx_branches_bank_city ON branches(bank_slug, state_slug, city_slug)`,
  `CREATE INDEX IF NOT EXISTS idx_branches_city ON branches(city_slug)`,
  `CREATE INDEX IF NOT EXISTS idx_branches_state ON branches(state_slug)`,
  `CREATE INDEX IF NOT EXISTS idx_branches_code ON branches(bank_code)`,
];

const COLUMNS = [
  'ifsc', 'bank_code', 'bank_name', 'bank_slug', 'branch', 'centre', 'district',
  'state', 'state_slug', 'city', 'city_slug', 'address', 'contact', 'micr',
  'swift', 'iso3166', 'upi', 'imps', 'rtgs', 'neft', 'updated_at',
] as const;

function toRecord(b: BranchRow): Record<string, unknown> {
  return {
    ifsc: b.ifsc, bank_code: b.bankCode, bank_name: b.bankName, bank_slug: b.bankSlug,
    branch: b.branch, centre: b.centre, district: b.district, state: b.state,
    state_slug: b.stateSlug, city: b.city, city_slug: b.citySlug, address: b.address,
    contact: b.contact, micr: b.micr, swift: b.swift, iso3166: b.iso3166,
    upi: b.upi ? 1 : 0, imps: b.imps ? 1 : 0, rtgs: b.rtgs ? 1 : 0,
    neft: b.neft ? 1 : 0, updated_at: b.updatedAt,
  };
}

// ── Main ─────────────────────────────────────────────────────
async function main() {
  if (!DB_URL) die('SUPABASE_DB_URL is not set (see .env.example).');

  console.log('• Loading dataset…');
  const raw = await loadSource();
  const updatedAt = new Date().toISOString();
  const rows = raw
    .filter((r) => r.IFSC && /^[A-Za-z]{4}0/.test(r.IFSC))
    .map((r) => normalizeRaw(r, updatedAt));
  console.log(`  parsed ${rows.length.toLocaleString()} branches`);
  if (rows.length === 0) die('No valid rows parsed — check the source format.');

  const sql = postgres(DB_URL, { prepare: false, idle_timeout: 20, max: 4 });

  try {
    console.log('• Creating schema…');
    for (const ddl of SCHEMA) await sql.unsafe(ddl);
    await sql`DELETE FROM branches`;
    await sql`DELETE FROM banks`;

    console.log('• Inserting branches…');
    for (let i = 0; i < rows.length; i += BATCH) {
      const chunk = rows.slice(i, i + BATCH).map(toRecord);
      await sql`INSERT INTO branches ${sql(chunk, ...COLUMNS)}`;
      process.stdout.write(`\r  ${Math.min(i + BATCH, rows.length)}/${rows.length}`);
    }
    process.stdout.write('\n');

    console.log('• Building bank aggregates…');
    await sql`
      INSERT INTO banks (slug, code, name, branch_count, updated_at)
      SELECT bank_slug, MIN(bank_code), MIN(bank_name), COUNT(*), ${updatedAt}
      FROM branches GROUP BY bank_slug
    `;

    console.log('• Creating indexes…');
    for (const ddl of INDEXES) await sql.unsafe(ddl);

    const banks = await sql`SELECT COUNT(*)::int AS c FROM banks`;
    console.log(
      `\n✓ Done — ${rows.length.toLocaleString()} branches, ${banks[0]?.c} banks.\n`,
    );
  } finally {
    await sql.end();
  }
}

main().catch((e) => die(e instanceof Error ? e.stack ?? e.message : String(e)));
