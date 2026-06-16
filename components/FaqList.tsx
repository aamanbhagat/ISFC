import type { FaqItem } from '@/types/ifsc';

// No-JS disclosure list (native <details>). The matching FAQPage JSON-LD is
// emitted separately on the page.
export function FaqList({ items }: { items: FaqItem[] }) {
  return (
    <div className="faq">
      {items.map((item) => (
        <details className="faq-item" key={item.question}>
          <summary>{item.question}</summary>
          <p className="faq-answer">{item.answer}</p>
        </details>
      ))}
    </div>
  );
}
