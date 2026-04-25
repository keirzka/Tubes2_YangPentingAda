import type { DOMNode, SearchResponse, MatchFn } from "./types/dom.js";
import { Queue } from "./utils/queue.js";
import {
  createSearchMatcher,
  runTraversal,
  type Frontier,
} from "./searchCore.js";

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
  const matcher = createSearchMatcher(selectorOrFn);
  const queue = new Queue<DOMNode>();

  const frontier: Frontier<DOMNode> = {
    add: (node) => queue.enqueue(node),
    remove: () => queue.dequeue(),
    isEmpty: () => queue.isEmpty(),
  };

  return runTraversal(root, matcher, limit, frontier, "normal");
}