// Injects one or more JSON-LD blocks. Server component — no client JS.
export function SchemaOrg({ schemas }: { schemas: object[] }) {
  if (schemas.length === 0) return null;
  return (
    <script
      type="application/ld+json"
      // JSON.stringify output is safe to inline; no user HTML is interpolated.
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schemas.length === 1 ? schemas[0] : schemas),
      }}
    />
  );
}
