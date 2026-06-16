import { SITE_NAME, SITE_URL, SOCIAL_LINKS, absoluteUrl, urls } from '@/lib/seo';
import { extractPincode } from '@/lib/ifsc';
import type { BranchRow, FaqItem } from '@/types/ifsc';

type JsonLd = Record<string, unknown>;

// A branch as a schema.org BankOrCreditUnion (a LocalBusiness subtype). The
// IFSC is emitted both as `branchCode` and a typed `identifier` so search
// engines can tie the entity to the query.
export function buildBranchSchema(b: BranchRow): JsonLd {
  const pincode = extractPincode(b.address);
  const node: JsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BankOrCreditUnion',
    name: `${b.bankName} — ${b.branch}`,
    branchOf: { '@type': 'BankOrCreditUnion', name: b.bankName },
    branchCode: b.ifsc,
    identifier: [
      { '@type': 'PropertyValue', propertyID: 'IFSC', value: b.ifsc },
      ...(b.micr
        ? [{ '@type': 'PropertyValue', propertyID: 'MICR', value: b.micr }]
        : []),
    ],
    url: absoluteUrl(urls.branch(b.ifsc)),
    address: {
      '@type': 'PostalAddress',
      streetAddress: b.address,
      addressLocality: b.city,
      addressRegion: b.state,
      ...(pincode ? { postalCode: pincode } : {}),
      addressCountry: 'IN',
    },
  };
  if (b.contact) node.telephone = b.contact;
  return node;
}

export function buildFAQSchema(faqs: FaqItem[]): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    })),
  };
}

export function buildBreadcrumbSchema(
  items: Array<{ name: string; url: string }>,
): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function buildItemListSchema(
  items: Array<{ name: string; url: string }>,
): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      url: item.url,
    })),
  };
}

export function buildOrganizationSchema(): JsonLd {
  const org: JsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: SITE_URL,
    logo: {
      '@type': 'ImageObject',
      url: absoluteUrl('/icon.svg'),
    },
    description:
      'A free directory of IFSC, MICR and SWIFT codes for every bank branch in India, sourced from the Reserve Bank of India.',
  };
  if (SOCIAL_LINKS.length > 0) org.sameAs = SOCIAL_LINKS;
  return org;
}

export function buildWebsiteSchema(): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}
