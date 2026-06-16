import { sitemapIndexXml, XML_HEADERS } from '@/lib/sitemap-xml';

export const revalidate = 86400;

export async function GET() {
  return new Response(await sitemapIndexXml(), { headers: XML_HEADERS });
}
