import { ArrowRight, BadgeCheck, Route } from 'lucide-react';
import { parseIfsc } from '@/lib/ifsc';
import { DATA_RELEASE } from '@/lib/seo';
import { CopyButton } from '@/components/CopyButton';

// ── The signature element ────────────────────────────────────
// The IFSC as a "routing code": three labelled segments (4 bank · 1 reserved ·
// 6 branch) with directional arrows — value routes from bank to branch — over a
// faint guilloché (banknote security-print). Tap to copy; amber verified stamp.
export function IfscPlate({ ifsc }: { ifsc: string }) {
  const { bank, reserved, branch } = parseIfsc(ifsc);
  return (
    <div className="route-card" aria-label={`IFSC code ${ifsc}`}>
      <div className="guilloche" aria-hidden />

      <div className="route-card__top">
        <span className="route-card__label">
          <Route aria-hidden /> IFSC Routing Code
        </span>
        <CopyButton value={ifsc} label="IFSC code" />
      </div>

      <div className="route-code">
        <span className="seg">
          <span className="seg__chars">{bank}</span>
          <span className="seg__tag">Bank</span>
        </span>
        <span className="seg__arrow" aria-hidden>
          <ArrowRight />
        </span>
        <span className="seg seg--rsv">
          <span className="seg__chars">{reserved}</span>
          <span className="seg__tag">Rsv</span>
        </span>
        <span className="seg__arrow" aria-hidden>
          <ArrowRight />
        </span>
        <span className="seg">
          <span className="seg__chars">{branch}</span>
          <span className="seg__tag">Branch</span>
        </span>
      </div>

      <p className="route-card__verify">
        <BadgeCheck aria-hidden />
        Verified against the RBI dataset · {DATA_RELEASE} release
      </p>
    </div>
  );
}
