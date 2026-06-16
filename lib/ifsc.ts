// Pure, isomorphic helpers — safe to import from both server code (lib/db.ts)
// and the sync script (scripts/sync-ifsc.ts). No 'server-only' here.
import type { BranchRow, RawBranch } from '@/types/ifsc';

// ── IFSC structure ───────────────────────────────────────────
// 11 chars: 4 bank · 1 reserved ('0') · 6 branch. The segmentation is the
// product's signature, so it gets a first-class parser.
const IFSC_RE = /^[A-Z]{4}0[A-Z0-9]{6}$/;

export function isValidIfsc(value: string): boolean {
  return IFSC_RE.test(value.toUpperCase());
}

export interface IfscSegments {
  bank: string; // first 4
  reserved: string; // 5th (always '0')
  branch: string; // last 6
}

export function parseIfsc(ifsc: string): IfscSegments {
  const u = ifsc.toUpperCase();
  return { bank: u.slice(0, 4), reserved: u.slice(4, 5), branch: u.slice(5) };
}

// ── Slugs ────────────────────────────────────────────────────
export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '') // strip diacritics
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

// A–Z bucket for index navigation; everything non-alpha falls under '#'.
export function azBucket(value: string): string {
  const c = value.trim().charAt(0).toUpperCase();
  return c >= 'A' && c <= 'Z' ? c : '#';
}

// ── Display tidy-up ──────────────────────────────────────────
// Dataset ships most text in ALL CAPS. Title-case those for readable headings,
// but leave already-mixed-case strings (e.g. "HDFC Bank") untouched.
const KEEP_UPPER = new Set(['HDFC', 'ICICI', 'SBI', 'IDBI', 'IDFC', 'RBL', 'IFSC', 'MICR', 'NEFT', 'RTGS', 'IMPS', 'UPI', 'PNB', 'UCO', 'IOB', 'YES']);

export function smartTitle(value: string): string {
  const v = value.trim();
  if (!v) return v;
  // Only reformat strings that are essentially all-caps.
  const letters = v.replace(/[^a-zA-Z]/g, '');
  if (letters && letters !== letters.toUpperCase()) return v;
  return v
    .toLowerCase()
    .replace(/\b([a-z])/g, (_, ch: string) => ch.toUpperCase())
    .replace(/\b([A-Za-z]+)\b/g, (word) =>
      KEEP_UPPER.has(word.toUpperCase()) ? word.toUpperCase() : word,
    );
}

// ── Normalization (raw dataset → BranchRow) ──────────────────
export function normalizeRaw(raw: RawBranch, updatedAt: string): BranchRow {
  const bankName = raw.BANK?.trim() || raw.BANKCODE;
  const state = smartTitle(raw.STATE || '');
  const city = smartTitle(raw.CITY || raw.CENTRE || raw.DISTRICT || '');
  return {
    ifsc: raw.IFSC.toUpperCase(),
    bankCode: raw.BANKCODE.toUpperCase(),
    bankName,
    bankSlug: slugify(bankName),
    branch: smartTitle(raw.BRANCH || ''),
    centre: smartTitle(raw.CENTRE || ''),
    district: smartTitle(raw.DISTRICT || ''),
    state,
    stateSlug: slugify(state),
    city,
    citySlug: slugify(city),
    address: smartTitle(raw.ADDRESS || ''),
    contact: cleanContact(raw.CONTACT),
    micr: cleanCode(raw.MICR),
    swift: cleanCode(raw.SWIFT),
    iso3166: raw.ISO3166 || null,
    upi: Boolean(raw.UPI),
    imps: Boolean(raw.IMPS),
    rtgs: Boolean(raw.RTGS),
    neft: Boolean(raw.NEFT),
    updatedAt,
  };
}

function cleanCode(v: string | null | undefined): string | null {
  const s = (v ?? '').trim();
  if (!s || s.toUpperCase() === 'NA' || /^0+$/.test(s)) return null;
  return s;
}

function cleanContact(v: string | null | undefined): string | null {
  const s = (v ?? '').trim();
  if (!s || s.toUpperCase() === 'NA' || /^\+?0+$/.test(s)) return null;
  return s;
}

// Postal code sniffed out of the run-on ADDRESS line, for JSON-LD PostalAddress.
export function extractPincode(address: string): string | null {
  const m = address.match(/(\d{3})\s?(\d{3})(?!\d)/);
  return m ? `${m[1]}${m[2]}` : null;
}
