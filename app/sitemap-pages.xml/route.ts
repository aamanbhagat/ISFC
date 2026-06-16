import { pagesSitemapXml, XML_HEADERS } from '@/lib/sitemap-xml';

export const revalidate = 86400;

export async function GET() {
  return new Response(await pagesSitemapXml(), { headers: XML_HEADERS });
}
