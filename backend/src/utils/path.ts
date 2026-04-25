// Utilitas path untuk DOMNode id.

// Format id: "html/body/div[1]/p[0]"

// Helper ini disertakan di response supaya frontend dapat
// melakukan highlight jalur root ke match pada visualisasi pohon,
// tanpa perlu re-traverse tree di sisi client.

export function inferAncestorIds(nodeId: string): string[] {
  const segments = nodeId.split("/");
  const ancestors: string[] = [];
  for (let i = 1; i <= segments.length; i++) {
    ancestors.push(segments.slice(0, i).join("/"));
  }
  return ancestors;
}