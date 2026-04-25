import { performance } from "node:perf_hooks";
import type { DOMNode, SearchResponse, MatchFn } from "../types/dom.js";
import { createMatcher, type CompiledMatcher, type ParentLookup } from "./selector.js";
import { TraversalLogger } from "../utils/logger.js";

export type Frontier<T> = {
  add(value: T): void;
  remove(): T | undefined;
  isEmpty(): boolean;
};

export type ChildOrder = "normal" | "reverse";

export function createSearchMatcher(
  selectorOrFn: string | MatchFn
): CompiledMatcher {
  if (typeof selectorOrFn === "string") {
    return createMatcher(selectorOrFn);
  }

  return (node) => selectorOrFn(node);
}

export function runTraversal(
  root: DOMNode,
  matcher: CompiledMatcher,
  limit: number | "all",
  frontier: Frontier<DOMNode>,
  childOrder: ChildOrder
): SearchResponse {
  const startTime = performance.now();

  const results: DOMNode[] = [];
  const logger = new TraversalLogger();

  const parentMap = new Map<string, DOMNode>();
  const getParent: ParentLookup = (node) => parentMap.get(node.id);

  let nodesVisited = 0;
  let terminatedEarly = false;

  frontier.add(root);

  while (!frontier.isEmpty()) {
    const current = frontier.remove();
    if (current === undefined) continue;

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

    const children =
      childOrder === "reverse"
        ? [...current.children].reverse()
        : current.children;

    for (const child of children) {
      parentMap.set(child.id, current);
      frontier.add(child);
    }
  }

  if (terminatedEarly) {
    while (!frontier.isEmpty()) {
      const skippedNode = frontier.remove();
      if (skippedNode !== undefined) {
        logger.record(skippedNode, "skip");
      }
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