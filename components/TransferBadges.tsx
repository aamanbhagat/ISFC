import { Check, Minus } from 'lucide-react';
import type { BranchRow } from '@/types/ifsc';

const MODES: Array<{ key: 'neft' | 'rtgs' | 'imps' | 'upi'; label: string }> = [
  { key: 'neft', label: 'NEFT' },
  { key: 'rtgs', label: 'RTGS' },
  { key: 'imps', label: 'IMPS' },
  { key: 'upi', label: 'UPI' },
];

// Which electronic transfers the branch participates in.
export function TransferBadges({ branch }: { branch: BranchRow }) {
  return (
    <ul className="transfers" aria-label="Supported transfers">
      {MODES.map(({ key, label }) => {
        const on = branch[key];
        return (
          <li key={key} className="transfer" data-on={on || undefined}>
            {on ? (
              <Check className="transfer__icon" aria-hidden />
            ) : (
              <Minus className="transfer__icon" aria-hidden />
            )}
            <span>{label}</span>
            <span className="sr-only">{on ? 'supported' : 'not supported'}</span>
          </li>
        );
      })}
    </ul>
  );
}
