// Raw record as published by the razorpay/ifsc dataset (and its API). The sync
// script and the bundled sample dataset both use this exact shape, so a single
// `normalizeRaw` path serves both.
export interface RawBranch {
  IFSC: string;
  BANK: string;
  BANKCODE: string;
  BRANCH: string;
  CENTRE: string;
  DISTRICT: string;
  STATE: string;
  CITY: string;
  ADDRESS: string;
  CONTACT: string | null;
  MICR: string | null;
  SWIFT: string | null;
  ISO3166: string | null;
  UPI: boolean;
  IMPS: boolean;
  RTGS: boolean;
  NEFT: boolean;
}

// Normalized row — what the app and the DB store. Display strings are already
// tidied; *_slug fields are URL-stable.
export interface BranchRow {
  ifsc: string;
  bankCode: string;
  bankName: string;
  bankSlug: string;
  branch: string;
  centre: string;
  district: string;
  state: string;
  stateSlug: string;
  city: string;
  citySlug: string;
  address: string;
  contact: string | null;
  micr: string | null;
  swift: string | null;
  iso3166: string | null;
  upi: boolean;
  imps: boolean;
  rtgs: boolean;
  neft: boolean;
  updatedAt: string;
}

// Lightweight projection for lists, cross-links and search results.
export interface BranchSummary {
  ifsc: string;
  bankName: string;
  branch: string;
  city: string;
  state: string;
}

export interface BankSummary {
  slug: string;
  code: string;
  name: string;
  branchCount: number;
}

export interface StateGroup {
  state: string;
  stateSlug: string;
  count: number;
}

export interface CityGroup {
  city: string;
  citySlug: string;
  district: string;
  count: number;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface BranchListing {
  items: BranchSummary[];
  total: number;
  page: number;
  perPage: number;
}
