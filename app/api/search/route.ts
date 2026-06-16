import { NextResponse } from 'next/server';
import { searchBranches } from '@/lib/db';

// Autocomplete endpoint for the search bar. Headers (noindex, no-store) are set
// for /api/* in next.config.ts.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get('q') ?? '').slice(0, 80);
  const results = await searchBranches(q, 12);
  return NextResponse.json({ results });
}
