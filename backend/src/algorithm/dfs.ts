import type { DOMNode, SearchResponse, MatchFn } from "../types/dom.js";
import { Stack } from "../utils/stack.js";
import {
  createSearchMatcher,
  runTraversal,
  type Frontier,
} from "../algorithm/searchCore.js";

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
  const matcher = createSearchMatcher(selectorOrFn);
  const stack = new Stack<DOMNode>();

  const frontier: Frontier<DOMNode> = {
    add: (node) => stack.push(node),
    remove: () => stack.pop(),
    isEmpty: () => stack.isEmpty(),
  };

  return runTraversal(root, matcher, limit, frontier, "reverse");
}