'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { urls } from '@/lib/seo';
import type { BranchSummary } from '@/types/ifsc';

// Search-first entry point. Autocompletes against /api/search (debounced) and
// routes Enter to /search?q= so there's always a JS-free fallback.
export function SearchBar({ autoFocus = false }: { autoFocus?: boolean }) {
  const router = useRouter();
  const [q, setQ] = useState('');
  const [results, setResults] = useState<BranchSummary[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const term = q.trim();
    if (term.length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }
    const ctrl = new AbortController();
    const t = window.setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(term)}`, {
          signal: ctrl.signal,
        });
        const data = (await res.json()) as { results: BranchSummary[] };
        setResults(data.results);
        setOpen(true);
        setActive(-1);
      } catch {
        /* aborted or offline */
      }
    }, 180);
    return () => {
      ctrl.abort();
      window.clearTimeout(t);
    };
  }, [q]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (active >= 0 && results[active]) {
      router.push(urls.branch(results[active].ifsc));
    } else if (q.trim().length >= 2) {
      router.push(`/search?q=${encodeURIComponent(q.trim())}`);
    }
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (!open) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, -1));
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  }

  return (
    <div className="search" ref={boxRef}>
      <form className="search-form" onSubmit={submit} role="search">
        <Search className="search-icon" aria-hidden />
        <input
          className="search-input"
          type="search"
          // eslint-disable-next-line jsx-a11y/no-autofocus
          autoFocus={autoFocus}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={onKeyDown}
          onFocus={() => results.length && setOpen(true)}
          placeholder="Search IFSC, bank, branch or city…"
          aria-label="Search for a bank branch"
          autoComplete="off"
          spellCheck={false}
        />
        <button className="search-submit" type="submit">
          Search
        </button>
      </form>

      {open && (
        <div className="search-results" role="listbox">
          {results.length === 0 ? (
            <p className="search-empty">No branches match “{q}”.</p>
          ) : (
            results.map((b, i) => (
              <a
                key={b.ifsc}
                href={urls.branch(b.ifsc)}
                className="search-result"
                role="option"
                aria-selected={i === active}
              >
                <span className="search-result__ifsc t-mono">{b.ifsc}</span>
                <span className="search-result__meta">
                  {b.bankName} — {b.branch}, {b.city}
                </span>
              </a>
            ))
          )}
        </div>
      )}
    </div>
  );
}
