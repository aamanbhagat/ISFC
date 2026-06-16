import { CopyButton } from '@/components/CopyButton';
import type { BranchRow } from '@/types/ifsc';

interface Field {
  label: string;
  value: string;
  mono?: boolean;
  copy?: boolean;
}

// The full record as a definition table. Codes are monospaced; MICR is
// copyable because people transcribe it onto cheques.
export function BranchTable({ branch }: { branch: BranchRow }) {
  const fields: Field[] = [
    { label: 'IFSC Code', value: branch.ifsc, mono: true, copy: true },
    ...(branch.micr
      ? [{ label: 'MICR Code', value: branch.micr, mono: true, copy: true }]
      : []),
    ...(branch.swift
      ? [{ label: 'SWIFT / BIC', value: branch.swift, mono: true }]
      : []),
    { label: 'Bank', value: branch.bankName },
    { label: 'Branch', value: branch.branch },
    { label: 'Address', value: branch.address },
    { label: 'City', value: branch.city },
    { label: 'District', value: branch.district },
    { label: 'State', value: branch.state },
    ...(branch.contact ? [{ label: 'Contact', value: branch.contact }] : []),
  ];

  return (
    <dl className="record-table">
      {fields.map((f) => (
        <div className="record-row" key={f.label}>
          <dt>{f.label}</dt>
          <dd>
            <span className={f.mono ? 't-mono' : undefined}>{f.value}</span>
            {f.copy && <CopyButton value={f.value} label={f.label} />}
          </dd>
        </div>
      ))}
    </dl>
  );
}
