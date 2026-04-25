import type { DOMNode, TraversalAction, TraversalLogEntry } from "../types/dom.js";

// TraversalLogger — encapsulate state logging supaya tidak
// mengotori main loop BFS/DFS dengan variabel `step` dan
// duplikasi object literal.

// Pemakaian:
//    const logger = new TraversalLogger();
//    logger.record(node, "visit");
//    logger.record(node, "match");
//    ...
//    return { traversalLog: logger.entries, ... };

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

  //Getter readonly — hasil akhir untuk dimasukkan ke SearchResponse
  get entries(): ReadonlyArray<TraversalLogEntry> {
    return this._entries;
  }

  get size(): number {
    return this._entries.length;
  }
}