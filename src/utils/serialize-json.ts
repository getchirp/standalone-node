/**
 * Serialize data for an inline JSON script element.
 *
 * JSON is valid inside a script element, but the HTML parser still treats
 * `</script>` as the end of that element. Escaping HTML-significant
 * characters keeps the payload data-only while preserving its JSON value.
 */
export function serializeJsonForHtml(value: unknown): string {
  const json = JSON.stringify(value);

  return (json ?? 'null')
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}
