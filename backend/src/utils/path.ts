
export function inferAncestorIds(nodeId: string): string[] {
  const segments = nodeId.split("/");
  const ancestors: string[] = [];
  for (let i = 1; i <= segments.length; i++) {
    ancestors.push(segments.slice(0, i).join("/"));
  }
  return ancestors;
}