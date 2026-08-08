/**
 * Renders a schema.org graph as a JSON-LD script tag.
 *
 * The site's CSP allows inline scripts, so this needs no nonce. `<` is escaped
 * to stop a stray `</script>` inside any string field from closing the tag.
 */
export default function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, '\\u003c'),
      }}
    />
  )
}
