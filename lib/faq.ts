import type { BranchRow, FaqItem } from '@/types/ifsc';

// Data-filled questions a person actually types before a transfer. Templated,
// but every answer is specific to this branch, so the page is not thin.
export function buildBranchFaqs(b: BranchRow): FaqItem[] {
  const transfers = [
    b.neft && 'NEFT',
    b.rtgs && 'RTGS',
    b.imps && 'IMPS',
    b.upi && 'UPI',
  ].filter(Boolean) as string[];

  const faqs: FaqItem[] = [
    {
      question: `What is the IFSC code of ${b.bankName} ${b.branch}?`,
      answer: `The IFSC code of ${b.bankName}, ${b.branch} branch (${b.city}, ${b.state}) is ${b.ifsc}. Use it for NEFT, RTGS and IMPS transfers to accounts at this branch.`,
    },
    {
      question: `What is the MICR code of ${b.bankName} ${b.branch}?`,
      answer: b.micr
        ? `The MICR code of ${b.bankName}, ${b.branch} is ${b.micr}. It appears on cheque leaves issued by this branch.`
        : `The MICR code for ${b.bankName}, ${b.branch} is not published in the RBI dataset for this branch.`,
    },
    {
      question: `Which transfers does ${b.bankName} ${b.branch} support?`,
      answer: transfers.length
        ? `This branch supports ${transfers.join(', ')}.`
        : `Transfer support is not listed for this branch in the RBI dataset.`,
    },
    {
      question: `Where is ${b.bankName} ${b.branch} located?`,
      answer: `${b.bankName}, ${b.branch} is at ${b.address}${
        b.address.endsWith('.') ? '' : '.'
      }`,
    },
  ];

  if (b.swift) {
    faqs.push({
      question: `What is the SWIFT code for ${b.bankName} ${b.branch}?`,
      answer: `The SWIFT/BIC code linked to ${b.bankName}, ${b.branch} is ${b.swift}, used for international transfers.`,
    });
  }

  return faqs;
}
