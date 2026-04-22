import type { DOMNode, MatchFn, SearchResponse } from "./types/dom";
import { Queue } from "./utils/queue";
import { TraversalLogger } from "./utils/logger";
import {
  createMatcher,
  type CompiledMatcher,
  type ParentLookup,
} from "./selector";

export function bfsSearch(
  root: DOMNode,
  selector: string,
  limit: number | "all"
): SearchResponse;
export function bfsSearch(
  root: DOMNode,
  matchFn: MatchFn,
  limit: number | "all"
): SearchResponse;
export function bfsSearch(
  root: DOMNode,
  selectorOrFn: string | MatchFn,
  limit: number | "all"
): SearchResponse {
  const matcher: CompiledMatcher =
    typeof selectorOrFn === "string"
      ? createMatcher(selectorOrFn)
      : (node) => (selectorOrFn as MatchFn)(node);

  return runBFS(root, matcher, limit);
}

function runBFS(
  root: DOMNode,
  matcher: CompiledMatcher,
  limit: number | "all"
): SearchResponse {
  const startTime = performance.now();

  const results: DOMNode[] = [];
  const logger = new TraversalLogger();
  const queue = new Queue<DOMNode>();

  const parentMap = new Map<string, DOMNode>();
  const getParent: ParentLookup = (n) => parentMap.get(n.id);

  let nodesVisited = 0;
  let terminatedEarly = false;

  queue.enqueue(root);

  while (!queue.isEmpty()) {
    const current = queue.dequeue();
    if (current === undefined) break;
    nodesVisited++;

    const isMatch = matcher(current, getParent);
    logger.record(current, isMatch ? "match" : "visit");

    if (isMatch) {
      results.push(current);
      if (limit !== "all" && results.length >= limit) {
        terminatedEarly = true;
        break;
      }
    }

    for (const child of current.children) {
      parentMap.set(child.id, current);
      queue.enqueue(child);
    }
  }

  if (terminatedEarly) {
    while (!queue.isEmpty()) {
      const n = queue.dequeue();
      if (n) logger.record(n, "skip");
    }
  }

  const endTime = performance.now();

  return {
    results,
    traversalLog: logger.entries,
    stats: {
      timeMs: Math.round((endTime - startTime) * 100) / 100,
      nodesVisited,
    },
  };
}