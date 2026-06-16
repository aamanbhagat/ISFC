import 'server-only';
import { cache } from 'react';
import { createClient, type Client, type Row } from '@libsql/client';
import sampleRaw from '@/data/sample-branches.json';
import { normalizeRaw } from '@/lib/ifsc';
import type {
  BankSummary,
  BranchListing,
  BranchRow,
  BranchSummary,
  CityGroup,
  RawBranch,
  StateGroup,
} from '@/types/ifsc';

// Data resolves Turso (libSQL) → bundled sample. Reads are deduped within a
// request with React `cache`; freshness comes from page-level `revalidate`
// (ISR). When TURSO_* env vars are absent the whole site runs off the bundled
// sample so it boots with zero configuration.

export const PER_PAGE = 50;

// Stable corpus timestamp — see getLatestUpdatedAt. Sample rows all share it.
const SAMPLE_UPDATED_AT = '2025-12-17T00:00:00.000Z';

// ── Turso client ─────────────────────────────────────────────
let _client: Client | null = null;
function isTursoConfigured(): boolean {
  return Boolean(process.env.TURSO_DATABASE_URL);
}
function db(): Client {
  if (!_client) {
    _client = createClient({
      url: process.env.TURSO_DATABASE_URL as string,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
  }
  return _client;
}

// ── Sample fallback (normalized once) ────────────────────────
const SAMPLE: BranchRow[] = (sampleRaw as RawBranch[]).map((r) =>
  normalizeRaw(r, SAMPLE_UPDATED_AT),
);

function rowToBranch(r: Row): BranchRow {
  return {
    ifsc: String(r.ifsc),
    bankCode: String(r.bank_code),
    bankName: String(r.bank_name),
    bankSlug: String(r.bank_slug),
    branch: String(r.branch),
    centre: String(r.centre ?? ''),
    district: String(r.district ?? ''),
    state: String(r.state ?? ''),
    stateSlug: String(r.state_slug ?? ''),
    city: String(r.city ?? ''),
    citySlug: String(r.city_slug ?? ''),
    address: String(r.address ?? ''),
    contact: r.contact == null ? null : String(r.contact),
    micr: r.micr == null ? null : String(r.micr),
    swift: r.swift == null ? null : String(r.swift),
    iso3166: r.iso3166 == null ? null : String(r.iso3166),
    upi: Number(r.upi) === 1,
    imps: Number(r.imps) === 1,
    rtgs: Number(r.rtgs) === 1,
    neft: Number(r.neft) === 1,
    updatedAt: String(r.updated_at ?? SAMPLE_UPDATED_AT),
  };
}

function toSummary(b: BranchRow): BranchSummary {
  return {
    ifsc: b.ifsc,
    bankName: b.bankName,
    branch: b.branch,
    city: b.city,
    state: b.state,
  };
}

// ── Single branch (leaf page) ────────────────────────────────
export const getBranch = cache(async (ifsc: string): Promise<BranchRow | null> => {
  const code = ifsc.toUpperCase();
  if (isTursoConfigured()) {
    const res = await db().execute({
      sql: 'select * from branches where ifsc = ? limit 1',
      args: [code],
    });
    return res.rows[0] ? rowToBranch(res.rows[0]) : null;
  }
  return SAMPLE.find((b) => b.ifsc === code) ?? null;
});

// Other branches of the same bank in the same city — leaf cross-links.
export const getSiblingBranches = cache(
  async (
    bankSlug: string,
    citySlug: string,
    exceptIfsc: string,
    limit = 12,
  ): Promise<BranchSummary[]> => {
    if (isTursoConfigured()) {
      const res = await db().execute({
        sql: `select ifsc, bank_name, branch, city, state from branches
              where bank_slug = ? and city_slug = ? and ifsc <> ?
              order by branch asc limit ?`,
        args: [bankSlug, citySlug, exceptIfsc.toUpperCase(), limit],
      });
      return res.rows.map((r) => ({
        ifsc: String(r.ifsc),
        bankName: String(r.bank_name),
        branch: String(r.branch),
        city: String(r.city),
        state: String(r.state),
      }));
    }
    return SAMPLE.filter(
      (b) =>
        b.bankSlug === bankSlug &&
        b.citySlug === citySlug &&
        b.ifsc !== exceptIfsc.toUpperCase(),
    )
      .slice(0, limit)
      .map(toSummary);
  },
);

// ── Banks ────────────────────────────────────────────────────
export const listBanks = cache(async (): Promise<BankSummary[]> => {
  if (isTursoConfigured()) {
    const res = await db().execute(
      'select slug, code, name, branch_count from banks order by name asc',
    );
    return res.rows.map((r) => ({
      slug: String(r.slug),
      code: String(r.code),
      name: String(r.name),
      branchCount: Number(r.branch_count),
    }));
  }
  const map = new Map<string, BankSummary>();
  for (const b of SAMPLE) {
    const cur = map.get(b.bankSlug);
    if (cur) cur.branchCount += 1;
    else
      map.set(b.bankSlug, {
        slug: b.bankSlug,
        code: b.bankCode,
        name: b.bankName,
        branchCount: 1,
      });
  }
  return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
});

export const getBank = cache(async (slug: string): Promise<BankSummary | null> => {
  if (isTursoConfigured()) {
    const res = await db().execute({
      sql: 'select slug, code, name, branch_count from banks where slug = ? limit 1',
      args: [slug],
    });
    const r = res.rows[0];
    return r
      ? {
          slug: String(r.slug),
          code: String(r.code),
          name: String(r.name),
          branchCount: Number(r.branch_count),
        }
      : null;
  }
  return (await listBanks()).find((b) => b.slug === slug) ?? null;
});

// States a bank operates in (bank hub).
export const getStatesForBank = cache(
  async (bankSlug: string): Promise<StateGroup[]> => {
    if (isTursoConfigured()) {
      const res = await db().execute({
        sql: `select state, state_slug, count(*) as c from branches
              where bank_slug = ? group by state_slug order by state asc`,
        args: [bankSlug],
      });
      return res.rows.map((r) => ({
        state: String(r.state),
        stateSlug: String(r.state_slug),
        count: Number(r.c),
      }));
    }
    return groupStates(SAMPLE.filter((b) => b.bankSlug === bankSlug));
  },
);

// Cities of a bank within a state (bank/state hub).
export const getCitiesForBankState = cache(
  async (bankSlug: string, stateSlug: string): Promise<CityGroup[]> => {
    if (isTursoConfigured()) {
      const res = await db().execute({
        sql: `select city, city_slug, district, count(*) as c from branches
              where bank_slug = ? and state_slug = ?
              group by city_slug order by city asc`,
        args: [bankSlug, stateSlug],
      });
      return res.rows.map((r) => ({
        city: String(r.city),
        citySlug: String(r.city_slug),
        district: String(r.district ?? ''),
        count: Number(r.c),
      }));
    }
    return groupCities(
      SAMPLE.filter((b) => b.bankSlug === bankSlug && b.stateSlug === stateSlug),
    );
  },
);

// Branches of a bank in a city (bank/state/city hub, paginated).
export const getBranchesByBankCity = cache(
  async (
    bankSlug: string,
    stateSlug: string,
    citySlug: string,
    page = 1,
  ): Promise<BranchListing> => {
    const safePage = Math.max(1, page);
    const offset = (safePage - 1) * PER_PAGE;
    if (isTursoConfigured()) {
      const where = 'bank_slug = ? and state_slug = ? and city_slug = ?';
      const args = [bankSlug, stateSlug, citySlug];
      const countRes = await db().execute({
        sql: `select count(*) as c from branches where ${where}`,
        args,
      });
      const total = Number(countRes.rows[0]?.c ?? 0);
      const res = await db().execute({
        sql: `select ifsc, bank_name, branch, city, state from branches
              where ${where} order by branch asc limit ? offset ?`,
        args: [...args, PER_PAGE, offset],
      });
      return {
        items: res.rows.map((r) => ({
          ifsc: String(r.ifsc),
          bankName: String(r.bank_name),
          branch: String(r.branch),
          city: String(r.city),
          state: String(r.state),
        })),
        total,
        page: safePage,
        perPage: PER_PAGE,
      };
    }
    const all = SAMPLE.filter(
      (b) =>
        b.bankSlug === bankSlug &&
        b.stateSlug === stateSlug &&
        b.citySlug === citySlug,
    ).sort((a, b) => a.branch.localeCompare(b.branch));
    return {
      items: all.slice(offset, offset + PER_PAGE).map(toSummary),
      total: all.length,
      page: safePage,
      perPage: PER_PAGE,
    };
  },
);

// ── States (state index + state hub) ─────────────────────────
export const listStates = cache(async (): Promise<StateGroup[]> => {
  if (isTursoConfigured()) {
    const res = await db().execute(
      `select state, state_slug, count(*) as c from branches
       group by state_slug order by state asc`,
    );
    return res.rows.map((r) => ({
      state: String(r.state),
      stateSlug: String(r.state_slug),
      count: Number(r.c),
    }));
  }
  return groupStates(SAMPLE);
});

export const getBanksForState = cache(
  async (stateSlug: string): Promise<BankSummary[]> => {
    if (isTursoConfigured()) {
      const res = await db().execute({
        sql: `select b.bank_slug as slug, b.bank_code as code, b.bank_name as name,
                     count(*) as c
              from branches b where b.state_slug = ?
              group by b.bank_slug order by b.bank_name asc`,
        args: [stateSlug],
      });
      return res.rows.map((r) => ({
        slug: String(r.slug),
        code: String(r.code),
        name: String(r.name),
        branchCount: Number(r.c),
      }));
    }
    const map = new Map<string, BankSummary>();
    for (const b of SAMPLE.filter((x) => x.stateSlug === stateSlug)) {
      const cur = map.get(b.bankSlug);
      if (cur) cur.branchCount += 1;
      else
        map.set(b.bankSlug, {
          slug: b.bankSlug,
          code: b.bankCode,
          name: b.bankName,
          branchCount: 1,
        });
    }
    return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
  },
);

export const getStateName = cache(async (stateSlug: string): Promise<string | null> => {
  const states = await listStates();
  return states.find((s) => s.stateSlug === stateSlug)?.state ?? null;
});

// ── Home: a spread of notable branches ───────────────────────
export const getPopularBranches = cache(
  async (limit = 12): Promise<BranchSummary[]> => {
    if (isTursoConfigured()) {
      // One flagship branch per major bank — a stable, hand-picked spread.
      const res = await db().execute({
        sql: `select ifsc, bank_name, branch, city, state from branches
              where bank_code in ('SBIN','HDFC','ICIC','UTIB','PUNB','KKBK','BARB','CNRB','UBIN','BKID')
              group by bank_code limit ?`,
        args: [limit],
      });
      return res.rows.map((r) => ({
        ifsc: String(r.ifsc),
        bankName: String(r.bank_name),
        branch: String(r.branch),
        city: String(r.city),
        state: String(r.state),
      }));
    }
    return SAMPLE.slice(0, limit).map(toSummary);
  },
);

// ── Search (autocomplete API + /search) ──────────────────────
export async function searchBranches(
  query: string,
  limit = 12,
): Promise<BranchSummary[]> {
  const q = query.trim();
  if (q.length < 2) return [];

  // Exact IFSC short-circuit.
  if (/^[A-Za-z]{4}0[A-Za-z0-9]{6}$/.test(q)) {
    const b = await getBranch(q);
    return b ? [toSummary(b)] : [];
  }

  // Multi-word: every token must appear somewhere in the record, so
  // "hdfc mumbai" or "sbi delhi" work the way people type them.
  const tokens = q.split(/\s+/).filter(Boolean).slice(0, 6);

  if (isTursoConfigured()) {
    const haystack =
      "(bank_name||' '||branch||' '||city||' '||state||' '||ifsc)";
    const where = tokens.map(() => `${haystack} LIKE ?`).join(' AND ');
    const args: (string | number)[] = tokens.map((t) => `%${t}%`);
    args.push(`${tokens[0]}%`, limit);
    const res = await db().execute({
      sql: `select ifsc, bank_name, branch, city, state from branches
            where ${where}
            order by case when ifsc like ? then 0 else 1 end, length(branch) asc
            limit ?`,
      args,
    });
    return res.rows.map((r) => ({
      ifsc: String(r.ifsc),
      bankName: String(r.bank_name),
      branch: String(r.branch),
      city: String(r.city),
      state: String(r.state),
    }));
  }

  const needles = tokens.map((t) => t.toLowerCase());
  return SAMPLE.filter((b) => {
    const hay = `${b.bankName} ${b.branch} ${b.city} ${b.state} ${b.ifsc}`.toLowerCase();
    return needles.every((n) => hay.includes(n));
  })
    .slice(0, limit)
    .map(toSummary);
}

// ── Build-time prerender sets (top-N, bounded) ───────────────
export async function getTopBranchIfscs(limit: number): Promise<string[]> {
  if (isTursoConfigured()) {
    const res = await db().execute({
      sql: `select ifsc from branches
            where bank_code in ('SBIN','HDFC','ICIC','UTIB','PUNB','KKBK','BARB','CNRB','UBIN','BKID')
            order by ifsc asc limit ?`,
      args: [limit],
    });
    return res.rows.map((r) => String(r.ifsc));
  }
  return SAMPLE.slice(0, limit).map((b) => b.ifsc);
}

export async function getAllBankSlugs(): Promise<string[]> {
  return (await listBanks()).map((b) => b.slug);
}

// ── Sitemap helpers ──────────────────────────────────────────
export const getLatestUpdatedAt = cache(async (): Promise<string> => {
  if (isTursoConfigured()) {
    const res = await db().execute(
      'select max(updated_at) as m from branches',
    );
    const m = res.rows[0]?.m;
    if (m) return new Date(String(m)).toISOString();
  }
  return SAMPLE_UPDATED_AT;
});

export async function countBranches(): Promise<number> {
  if (isTursoConfigured()) {
    const res = await db().execute('select count(*) as c from branches');
    return Number(res.rows[0]?.c ?? 0);
  }
  return SAMPLE.length;
}

export async function getBranchShard(
  offset: number,
  size: number,
): Promise<Array<{ ifsc: string; updatedAt: string }>> {
  if (isTursoConfigured()) {
    const res = await db().execute({
      sql: 'select ifsc, updated_at from branches order by ifsc asc limit ? offset ?',
      args: [size, offset],
    });
    return res.rows.map((r) => ({
      ifsc: String(r.ifsc),
      updatedAt: new Date(String(r.updated_at ?? SAMPLE_UPDATED_AT)).toISOString(),
    }));
  }
  return SAMPLE.slice(offset, offset + size).map((b) => ({
    ifsc: b.ifsc,
    updatedAt: b.updatedAt,
  }));
}

export interface CityHubParam {
  bankSlug: string;
  stateSlug: string;
  citySlug: string;
}

export async function countCityHubs(): Promise<number> {
  if (isTursoConfigured()) {
    const res = await db().execute(
      'select count(*) as c from (select 1 from branches group by bank_slug, state_slug, city_slug)',
    );
    return Number(res.rows[0]?.c ?? 0);
  }
  return distinctCityHubs(SAMPLE).length;
}

export async function getCityHubShard(
  offset: number,
  size: number,
): Promise<CityHubParam[]> {
  if (isTursoConfigured()) {
    const res = await db().execute({
      sql: `select bank_slug, state_slug, city_slug from branches
            group by bank_slug, state_slug, city_slug
            order by bank_slug, state_slug, city_slug limit ? offset ?`,
      args: [size, offset],
    });
    return res.rows.map((r) => ({
      bankSlug: String(r.bank_slug),
      stateSlug: String(r.state_slug),
      citySlug: String(r.city_slug),
    }));
  }
  return distinctCityHubs(SAMPLE).slice(offset, offset + size);
}

// All distinct (bankSlug, stateSlug) pairs — for the pages sitemap.
export async function getBankStateParams(): Promise<
  Array<{ bankSlug: string; stateSlug: string }>
> {
  if (isTursoConfigured()) {
    const res = await db().execute(
      `select bank_slug, state_slug from branches
       group by bank_slug, state_slug order by bank_slug, state_slug`,
    );
    return res.rows.map((r) => ({
      bankSlug: String(r.bank_slug),
      stateSlug: String(r.state_slug),
    }));
  }
  const seen = new Set<string>();
  const out: Array<{ bankSlug: string; stateSlug: string }> = [];
  for (const b of SAMPLE) {
    const k = `${b.bankSlug}|${b.stateSlug}`;
    if (!seen.has(k)) {
      seen.add(k);
      out.push({ bankSlug: b.bankSlug, stateSlug: b.stateSlug });
    }
  }
  return out;
}

// ── In-memory grouping (sample mode) ─────────────────────────
function groupStates(rows: BranchRow[]): StateGroup[] {
  const map = new Map<string, StateGroup>();
  for (const b of rows) {
    const cur = map.get(b.stateSlug);
    if (cur) cur.count += 1;
    else map.set(b.stateSlug, { state: b.state, stateSlug: b.stateSlug, count: 1 });
  }
  return [...map.values()].sort((a, b) => a.state.localeCompare(b.state));
}

function groupCities(rows: BranchRow[]): CityGroup[] {
  const map = new Map<string, CityGroup>();
  for (const b of rows) {
    const cur = map.get(b.citySlug);
    if (cur) cur.count += 1;
    else
      map.set(b.citySlug, {
        city: b.city,
        citySlug: b.citySlug,
        district: b.district,
        count: 1,
      });
  }
  return [...map.values()].sort((a, b) => a.city.localeCompare(b.city));
}

function distinctCityHubs(rows: BranchRow[]): CityHubParam[] {
  const seen = new Set<string>();
  const out: CityHubParam[] = [];
  for (const b of rows) {
    const k = `${b.bankSlug}|${b.stateSlug}|${b.citySlug}`;
    if (!seen.has(k)) {
      seen.add(k);
      out.push({ bankSlug: b.bankSlug, stateSlug: b.stateSlug, citySlug: b.citySlug });
    }
  }
  return out;
}
