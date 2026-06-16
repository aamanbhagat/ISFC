import { BadgeCheck } from 'lucide-react';
import { parseIfsc } from '@/lib/ifsc';
import { DATA_RELEASE } from '@/lib/seo';
import { CopyButton } from '@/components/CopyButton';

// ── The signature element ────────────────────────────────────
// The 11-char IFSC rendered as a precision instrument: three labelled segments
// (4 bank · 1 reserved · 6 branch), a verified stamp, and tap-to-copy. This is
// the one bold thing on the page; everything else stays quiet.
export function IfscPlate({ ifsc }: { ifsc: string }) {
  const { bank, reserved, branch } = parseIfsc(ifsc);
  return (
    <div className="plate" aria-label={`IFSC code ${ifsc}`}>
      <div className="plate__top">
        <span className="plate__label">IFSC Code</span>
        <CopyButton value={ifsc} label="IFSC code" />
      </div>

      <div className="plate__code">
        <span className="seg">
          <span className="seg__chars">{bank}</span>
          <span className="seg__tag">Bank</span>
        </span>
        <span className="seg seg--rsv">
          <span className="seg__chars">{reserved}</span>
          <span className="seg__tag">Rsv</span>
        </span>
        <span className="seg">
          <span className="seg__chars">{branch}</span>
          <span className="seg__tag">Branch</span>
        </span>
      </div>

      <p className="plate__verify">
        <BadgeCheck className="plate__verify-icon" aria-hidden />
        Verified against the RBI dataset · {DATA_RELEASE} release
      </p>
    </div>
  );
}
