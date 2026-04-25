export function convertDomToTree(node, matchIds, visitedIds) {
  const isMatch = matchIds.has(node.id);
  const isVisited = visitedIds.has(node.id);

  if(!node) return null;

  return {
    name: node.tag,

    attributes: {
      id: node.attributes?.id,
      class: node.attributes?.class,
      match: isMatch,
      visited: isVisited,
    },

    children: node.children?.map(child =>
      convertDomToTree(child, matchIds, visitedIds)
    )
  };
}