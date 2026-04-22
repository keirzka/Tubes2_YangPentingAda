import type { DOMNode, MatchFn, SearchResponse } from "./types/dom";
import { Stack } from "./utils/stack";
import { TraversalLogger } from "./utils/logger";
import {
  createMatcher,
  type CompiledMatcher,
  type ParentLookup,
} from "./selector";

export function dfsSearch(
  root: DOMNode,
  selector: string,
  limit: number | "all"
): SearchResponse;
export function dfsSearch(
  root: DOMNode,
  matchFn: MatchFn,
  limit: number | "all"
): SearchResponse;
export function dfsSearch(
  root: DOMNode,
  selectorOrFn: string | MatchFn,
  limit: number | "all"
): SearchResponse {
  const matcher: CompiledMatcher =
    typeof selectorOrFn === "string"
      ? createMatcher(selectorOrFn)
      : (node) => (selectorOrFn as MatchFn)(node);

  return runDFS(root, matcher, limit);
}

function runDFS(
  root: DOMNode,
  matcher: CompiledMatcher,
  limit: number | "all"
): SearchResponse {
  const startTime = performance.now();

  const results: DOMNode[] = [];
  const logger = new TraversalLogger();
  const stack = new Stack<DOMNode>();

  const parentMap = new Map<string, DOMNode>();
  const getParent: ParentLookup = (n) => parentMap.get(n.id);

  let nodesVisited = 0;
  let terminatedEarly = false;

  stack.push(root);

  while (!stack.isEmpty()) {
    const current = stack.pop();
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

    for (let i = current.children.length - 1; i >= 0; i--) {
      const child = current.children[i];
      if (child === undefined) continue;

      parentMap.set(child.id, current);
      stack.push(child);
    }
  }

  if (terminatedEarly) {
    while (!stack.isEmpty()) {
      const n = stack.pop();
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