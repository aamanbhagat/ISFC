import { BadgeCheck } from 'lucide-react';
import { parseIfsc } from '@/lib/ifsc';
import { DATA_RELEASE } from '@/lib/seo';
import { CopyButton } from '@/components/CopyButton';

// ── The signature element ────────────────────────────────────
// The IFSC drawn as a dimensioned spec: each of the three parts (4 bank · 1
// reserved · 6 branch) sits over a dimension bracket annotated with its length,
// the way an engineering drawing calls out a measurement. Tap to copy; a
// safety-orange stamp marks it verified.
const SEGMENTS = [
  { key: 'bank', label: 'Bank · 4' },
  { key: 'rsv', label: 'Rsv · 1' },
  { key: 'branch', label: 'Branch · 6' },
] as const;

export function IfscPlate({ ifsc }: { ifsc: string }) {
  const parts = parseIfsc(ifsc);
  const value = { bank: parts.bank, rsv: parts.reserved, branch: parts.branch };
  return (
    <div className="spec" aria-label={`IFSC code ${ifsc}`}>
      <div className="spec__head">
        <span className="mono-label">IFSC · 11-char routing code</span>
        <CopyButton value={ifsc} label="IFSC code" />
      </div>

      <div className="spec__code">
        {SEGMENTS.map((seg) => (
          <div
            key={seg.key}
            className={`dim${seg.key === 'rsv' ? ' dim--rsv' : ''}`}
          >
            <span className="dim__chars">{value[seg.key]}</span>
            <span className="dim__bracket" aria-hidden />
            <span className="dim__label">{seg.label}</span>
          </div>
        ))}
      </div>

      <p className="spec__verify">
        <BadgeCheck aria-hidden />
        Verified · RBI {DATA_RELEASE}
      </p>
    </div>
  );
}
