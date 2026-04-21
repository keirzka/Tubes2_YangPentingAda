export type TraversalAction = "visit" | "match" | "skip";
export type TraversalLog = ReadonlyArray<TraversalLogEntry>;

export type ScrapeResult = 
    | { success: true; html: string}
    | { success: false; error: string};

export type ParseResult =
    | { success: true; domTree: DOMNode; maxDepth: number }
    | { success: false; error: string};

export interface TraversalLogEntry {
  readonly step: number;     // urutan langkah, dimulai dari 1
  readonly nodeId: string;   // path: "html/body/div[1]/p[0]"
  readonly tag: string;      // "div", "p", "span", ...
  readonly action: TraversalAction;
  readonly depth: number;    // kedalaman node di tree, root = 0
};

export interface DOMNode {
  readonly id: string; 
  readonly tag: string; 
  readonly attributes: Readonly<Record<string, string>>; 
  readonly children: ReadonlyArray<DOMNode>;
  readonly depth: number;
  readonly innerText?: string;
};

export interface SearchResponse {
  readonly results: ReadonlyArray<DOMNode>;
  readonly traversalLog: TraversalLog;
  readonly stats: Readonly<{
    timeMs: number;
    nodesVisited: number;
  }>;
};