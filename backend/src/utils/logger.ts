import type { DOMNode, TraversalAction, TraversalLogEntry } from "../types/dom.js";

export class TraversalLogger {
  private _entries: TraversalLogEntry[] = [];
  private _step = 1;

  // Catat satu event traversal
  record(node: DOMNode, action: TraversalAction): void {
    this._entries.push({
      step: this._step++,
      nodeId: node.id,
      tag: node.tag,
      action,
      depth: node.depth,
    });
  }
  get entries(): ReadonlyArray<TraversalLogEntry> {
    return this._entries;
  }

  get size(): number {
    return this._entries.length;
  }
}