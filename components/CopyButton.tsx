'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';

// The one interactive island on the leaf page. Copies the code; falls back
// silently if the Clipboard API is unavailable.
export function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard blocked — no-op */
    }
  }

  return (
    <button
      type="button"
      className="copy-btn"
      onClick={onCopy}
      aria-label={copied ? `${label} copied` : `Copy ${label}`}
      data-copied={copied || undefined}
    >
      {copied ? (
        <Check className="copy-btn__icon" aria-hidden />
      ) : (
        <Copy className="copy-btn__icon" aria-hidden />
      )}
      <span>{copied ? 'Copied' : 'Copy'}</span>
    </button>
  );
}
