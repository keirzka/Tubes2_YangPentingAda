import { performance } from "node:perf_hooks";
import type { DOMNode } from "../types/dom.js";

export type LcaNodeSummary = {
  readonly id: string;
  readonly tag: string;
  readonly depth: number;
  readonly attributes: Readonly<Record<string, string>>;
};

export type LcaQueryResult = {
  readonly nodeA: LcaNodeSummary;
  readonly nodeB: LcaNodeSummary;
  readonly lca: LcaNodeSummary;
  readonly pathA: string[];
  readonly pathB: string[];
  readonly pathFromAToLca: string[];
  readonly pathFromBToLca: string[];
  readonly distance: number;
  readonly stats: {
    readonly nodeCount: number;
    readonly log: number;
    readonly preprocessTimeMs: number;
    readonly queryTimeMs: number;
  };
};

export function lcaQuery(
  root: DOMNode,
  nodeIdA: string,
  nodeIdB: string
): LcaQueryResult {
  const index = new LCAIndex(root);
  return index.query(nodeIdA, nodeIdB);
}

export class LCAIndex {
  readonly nodeCount: number;
  readonly logSize: number;
  readonly preprocessTimeMs: number;

  private readonly nodeMap: Map<string, DOMNode>;
  private readonly parentMap: Map<string, string>;
  private readonly depthMap: Map<string, number>;
  private readonly tin: Map<string, number>;
  private readonly tout: Map<string, number>;
  private readonly up: Map<string, string[]>;

  constructor(root: DOMNode) {
    this.validateRoot(root);

    const startTime = performance.now();

    this.nodeMap = new Map();
    this.parentMap = new Map();
    this.depthMap = new Map();
    this.tin = new Map();
    this.tout = new Map();
    this.up = new Map();

    this.indexAllNodes(root);

    this.nodeCount = this.nodeMap.size;
    this.logSize = Math.max(1, Math.ceil(Math.log2(this.nodeCount + 1)));

    this.runIterativeDFS(root);
    this.buildUpTable();

    this.preprocessTimeMs = roundMs(performance.now() - startTime);
  }

  query(nodeIdA: string, nodeIdB: string): LcaQueryResult {
    const queryStartTime = performance.now();

    const nodeA = this.requireNode(nodeIdA);
    const nodeB = this.requireNode(nodeIdB);

    const lcaId = this.findLcaId(nodeIdA, nodeIdB);
    const lcaNode = this.requireNode(lcaId);

    const depthA = this.requireDepth(nodeIdA);
    const depthB = this.requireDepth(nodeIdB);
    const depthLca = this.requireDepth(lcaId);

    const distance = depthA + depthB - 2 * depthLca;

    const pathA = this.getPathFromRoot(nodeIdA);
    const pathB = this.getPathFromRoot(nodeIdB);
    const pathFromAToLca = this.getPathToAncestor(nodeIdA, lcaId);
    const pathFromBToLca = this.getPathToAncestor(nodeIdB, lcaId);

    const queryTimeMs = roundMs(performance.now() - queryStartTime);

    return {
      nodeA: this.summarize(nodeA),
      nodeB: this.summarize(nodeB),
      lca: this.summarize(lcaNode),
      pathA,
      pathB,
      pathFromAToLca,
      pathFromBToLca,
      distance,
      stats: {
        nodeCount: this.nodeCount,
        log: this.logSize,
        preprocessTimeMs: this.preprocessTimeMs,
        queryTimeMs,
      },
    };
  }

  getNode(nodeId: string): DOMNode | undefined {
    return this.nodeMap.get(nodeId);
  }

  isAncestor(ancestorId: string, nodeId: string): boolean {
    const ancestorIn = this.tin.get(ancestorId);
    const ancestorOut = this.tout.get(ancestorId);
    const nodeIn = this.tin.get(nodeId);
    const nodeOut = this.tout.get(nodeId);

    if (
      ancestorIn === undefined ||
      ancestorOut === undefined ||
      nodeIn === undefined ||
      nodeOut === undefined
    ) {
      return false;
    }

    return ancestorIn <= nodeIn && nodeOut <= ancestorOut;
  }

  getPathToRoot(nodeId: string): string[] {
    this.requireNode(nodeId);

    const path: string[] = [];
    let current = nodeId;

    while (true) {
      path.push(current);

      const parent = this.parentMap.get(current);

      if (parent === undefined) {
        throw new Error(`Parent of node '${current}' was not found`);
      }

      if (parent === current) {
        break;
      }

      current = parent;
    }

    return path;
  }

  getPathFromRoot(nodeId: string): string[] {
    return this.getPathToRoot(nodeId).reverse();
  }

  getPathToAncestor(nodeId: string, ancestorId: string): string[] {
    this.requireNode(nodeId);
    this.requireNode(ancestorId);

    if (!this.isAncestor(ancestorId, nodeId)) {
      throw new Error(`Node '${ancestorId}' is not an ancestor of '${nodeId}'`);
    }

    const path: string[] = [];
    let current = nodeId;

    while (true) {
      path.push(current);

      if (current === ancestorId) {
        break;
      }

      const parent = this.parentMap.get(current);

      if (parent === undefined) {
        throw new Error(`Parent of node '${current}' was not found`);
      }

      if (parent === current) {
        break;
      }

      current = parent;
    }

    return path;
  }

  private validateRoot(root: DOMNode): void {
    if (root === null || typeof root !== "object") {
      throw new Error("Invalid root: expected DOMNode object");
    }

    if (typeof root.id !== "string" || root.id.length === 0) {
      throw new Error("Invalid root: expected non-empty string 'id'");
    }

    if (typeof root.tag !== "string" || root.tag.length === 0) {
      throw new Error(`Invalid root '${root.id}': expected non-empty string 'tag'`);
    }

    if (
      root.attributes === null ||
      typeof root.attributes !== "object" ||
      Array.isArray(root.attributes)
    ) {
      throw new Error(`Invalid root '${root.id}': attributes must be an object`);
    }

    if (!Array.isArray(root.children)) {
      throw new Error(`Invalid root '${root.id}': children must be an array`);
    }
  }

  private validateNode(node: DOMNode): void {
    if (node === null || typeof node !== "object") {
      throw new Error("Invalid node: expected DOMNode object");
    }

    if (typeof node.id !== "string" || node.id.length === 0) {
      throw new Error("Invalid node: missing or empty 'id'");
    }

    if (typeof node.tag !== "string" || node.tag.length === 0) {
      throw new Error(`Invalid node '${node.id}': missing or empty 'tag'`);
    }

    if (
      node.attributes === null ||
      typeof node.attributes !== "object" ||
      Array.isArray(node.attributes)
    ) {
      throw new Error(`Invalid node '${node.id}': attributes must be an object`);
    }

    if (!Array.isArray(node.children)) {
      throw new Error(`Invalid node '${node.id}': children must be an array`);
    }
  }

  private indexAllNodes(root: DOMNode): void {
    const stack: DOMNode[] = [root];

    while (stack.length > 0) {
      const node = stack.pop();

      if (node === undefined) {
        continue;
      }

      this.validateNode(node);

      if (this.nodeMap.has(node.id)) {
        throw new Error(`Duplicate node id '${node.id}'`);
      }

      this.nodeMap.set(node.id, node);

      for (const child of node.children) {
        stack.push(child);
      }
    }
  }

  private runIterativeDFS(root: DOMNode): void {
    type Frame = {
      node: DOMNode;
      childIndex: number;
    };

    let timer = 0;

    this.parentMap.set(root.id, root.id);
    this.depthMap.set(root.id, 0);

    const rootUp = new Array<string>(this.logSize);
    rootUp.fill(root.id);
    this.up.set(root.id, rootUp);

    const stack: Frame[] = [
      {
        node: root,
        childIndex: -1,
      },
    ];

    while (stack.length > 0) {
      const frame = stack[stack.length - 1];

      if (frame === undefined) {
        continue;
      }

      const node = frame.node;

      if (frame.childIndex === -1) {
        this.tin.set(node.id, timer);
        timer += 1;
        frame.childIndex = 0;
        continue;
      }

      if (frame.childIndex < node.children.length) {
        const child = node.children[frame.childIndex];

        frame.childIndex += 1;

        if (child === undefined) {
          continue;
        }

        this.validateNode(child);

        if (!this.nodeMap.has(child.id)) {
          throw new Error(`Child '${child.id}' was not indexed`);
        }

        this.parentMap.set(child.id, node.id);
        this.depthMap.set(child.id, this.requireDepth(node.id) + 1);

        const childUp = new Array<string>(this.logSize);
        childUp[0] = node.id;
        this.up.set(child.id, childUp);

        stack.push({
          node: child,
          childIndex: -1,
        });

        continue;
      }

      this.tout.set(node.id, timer);
      timer += 1;
      stack.pop();
    }
  }

  private buildUpTable(): void {
    for (let level = 1; level < this.logSize; level += 1) {
      for (const [nodeId, table] of this.up) {
        const previousAncestor = table[level - 1];

        if (previousAncestor === undefined) {
          throw new Error(
            `Missing 2^${level - 1} ancestor for node '${nodeId}'`
          );
        }

        const previousTable = this.up.get(previousAncestor);

        if (previousTable === undefined) {
          throw new Error(
            `Ancestor table for node '${previousAncestor}' was not found`
          );
        }

        const nextAncestor = previousTable[level - 1];

        if (nextAncestor === undefined) {
          throw new Error(
            `Missing 2^${level - 1} ancestor for node '${previousAncestor}'`
          );
        }

        table[level] = nextAncestor;
      }
    }
  }

  private findLcaId(nodeIdA: string, nodeIdB: string): string {
    this.requireNode(nodeIdA);
    this.requireNode(nodeIdB);

    if (nodeIdA === nodeIdB) {
      return nodeIdA;
    }

    if (this.isAncestor(nodeIdA, nodeIdB)) {
      return nodeIdA;
    }

    if (this.isAncestor(nodeIdB, nodeIdA)) {
      return nodeIdB;
    }

    let current = nodeIdA;

    for (let level = this.logSize - 1; level >= 0; level -= 1) {
      const currentTable = this.up.get(current);

      if (currentTable === undefined) {
        throw new Error(`Ancestor table for node '${current}' was not found`);
      }

      const candidate = currentTable[level];

      if (candidate === undefined) {
        throw new Error(`Missing 2^${level} ancestor for node '${current}'`);
      }

      if (!this.isAncestor(candidate, nodeIdB)) {
        current = candidate;
      }
    }

    const parent = this.up.get(current)?.[0];

    if (parent === undefined) {
      throw new Error(`Parent ancestor of node '${current}' was not found`);
    }

    return parent;
  }

  private requireNode(nodeId: string): DOMNode {
    if (typeof nodeId !== "string" || nodeId.length === 0) {
      throw new Error("Node id must be a non-empty string");
    }

    const node = this.nodeMap.get(nodeId);

    if (node === undefined) {
      throw new Error(`Node with id '${nodeId}' was not found`);
    }

    return node;
  }

  private requireDepth(nodeId: string): number {
    const depth = this.depthMap.get(nodeId);

    if (depth === undefined) {
      throw new Error(`Depth of node '${nodeId}' was not found`);
    }

    return depth;
  }

  private summarize(node: DOMNode): LcaNodeSummary {
    return {
      id: node.id,
      tag: node.tag,
      depth: this.requireDepth(node.id),
      attributes: node.attributes ?? {},
    };
  }
}

function roundMs(ms: number): number {
  return Math.round(ms * 100) / 100;
}