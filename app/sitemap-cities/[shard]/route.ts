import { citiesSitemapXml, XML_HEADERS } from '@/lib/sitemap-xml';

export const revalidate = 86400;
export const dynamicParams = true;

// Matches /sitemap-cities/0.xml — the shard segment arrives as "0.xml".
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ shard: string }> },
) {
  const { shard } = await params;
  const n = Number(shard.replace(/\.xml$/, ''));
  if (!Number.isInteger(n)) return new Response('Not found', { status: 404 });
  const xml = await citiesSitemapXml(n);
  if (xml === null) return new Response('Not found', { status: 404 });
  return new Response(xml, { headers: XML_HEADERS });
}
