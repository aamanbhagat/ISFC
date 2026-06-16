'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CornerDownLeft, Search } from 'lucide-react';
import { urls } from '@/lib/seo';
import type { BranchSummary } from '@/types/ifsc';

const HINTS = ['HDFC0000001', 'SBI Mumbai', 'ICICI Koramangala', 'Axis Pune'];

// The primary search UX — a ⌘K command palette mounted once (in the header).
// Opens on ⌘K / Ctrl-K, on "/" outside an input, or on a click of any element
// carrying [data-search-open]. Keyboard-first; routes Enter to a branch.
export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [results, setResults] = useState<BranchSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    setQ('');
    setResults([]);
    setActive(0);
  }, []);

  // Global open triggers.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const k = e.key.toLowerCase();
      if ((e.metaKey || e.ctrlKey) && k === 'k') {
        e.preventDefault();
        setOpen((v) => !v);
      } else if (
        k === '/' &&
        !open &&
        !/^(input|textarea|select)$/i.test((e.target as HTMLElement)?.tagName ?? '')
      ) {
        e.preventDefault();
        setOpen(true);
      } else if (k === 'escape') {
        close();
      }
    }
    function onClick(e: MouseEvent) {
      const t = (e.target as HTMLElement)?.closest('[data-search-open]');
      if (t) {
        e.preventDefault();
        setOpen(true);
      }
    }
    document.addEventListener('keydown', onKey);
    document.addEventListener('click', onClick);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('click', onClick);
    };
  }, [open, close]);

  // Lock scroll + focus input while open.
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = 'hidden';
    const t = window.setTimeout(() => inputRef.current?.focus(), 20);
    return () => {
      document.body.style.overflow = '';
      window.clearTimeout(t);
    };
  }, [open]);

  // Debounced fetch.
  useEffect(() => {
    const term = q.trim();
    if (term.length < 2) {
      setResults([]);
      setActive(0);
      setLoading(false);
      return;
    }
    setLoading(true);
    const ctrl = new AbortController();
    const t = window.setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(term)}`, {
          signal: ctrl.signal,
        });
        const data = (await res.json()) as { results: BranchSummary[] };
        setResults(data.results);
        setActive(0);
        setLoading(false);
      } catch {
        /* aborted — keep loading until the next request settles */
      }
    }, 160);
    return () => {
      ctrl.abort();
      window.clearTimeout(t);
    };
  }, [q]);

  function go(ifsc: string) {
    close();
    router.push(urls.branch(ifsc));
  }

  function onInputKey(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results[active]) go(results[active].ifsc);
      else if (q.trim().length >= 2) {
        close();
        router.push(`/search?q=${encodeURIComponent(q.trim())}`);
      }
    }
  }

  if (!open) return null;

  return (
    <div
      className="cmdk-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Search bank branches"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div className="cmdk-panel">
        <div className="cmdk-input-wrap">
          <Search aria-hidden />
          <input
            ref={inputRef}
            className="cmdk-input"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={onInputKey}
            placeholder="Search by IFSC, bank, branch or city…"
            aria-label="Search"
            autoComplete="off"
            spellCheck={false}
          />
          <span className="kbd">ESC</span>
        </div>

        {q.trim().length < 2 ? (
          <div className="cmdk-hints">
            <p className="cmdk-hints__title">Try</p>
            <div className="cmdk-chips">
              {HINTS.map((h) => (
                <button
                  key={h}
                  type="button"
                  className="cmdk-chip"
                  onClick={() => setQ(h)}
                >
                  {h}
                </button>
              ))}
            </div>
          </div>
        ) : loading && results.length === 0 ? (
          <p className="cmdk-empty">Searching…</p>
        ) : results.length === 0 ? (
          <p className="cmdk-empty">No branches match “{q.trim()}”.</p>
        ) : (
          <ul className="cmdk-list" role="listbox">
            {results.map((b, i) => (
              <li
                key={b.ifsc}
                role="option"
                aria-selected={i === active}
                className="cmdk-item"
                onMouseEnter={() => setActive(i)}
                onClick={() => go(b.ifsc)}
              >
                <span className="cmdk-item__ifsc">{b.ifsc}</span>
                <span className="cmdk-item__meta">
                  {b.bankName} — {b.branch}, {b.city}
                </span>
              </li>
            ))}
          </ul>
        )}

        <div className="cmdk-footer">
          <span>
            <span className="kbd">↑↓</span> navigate
          </span>
          <span>
            <span className="kbd">↵</span> open
          </span>
          <span>
            <span className="kbd">esc</span> close
          </span>
        </div>
      </div>
    </div>
  );
}
