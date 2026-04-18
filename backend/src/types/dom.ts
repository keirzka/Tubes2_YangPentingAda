export type TraversalAction = "visit" | "match" | "skip";

export type TraversalLogEntry = {
  readonly step: number;     // urutan langkah, dimulai dari 1
  readonly nodeId: string;   // path: "html/body/div[1]/p[0]"
  readonly tag: string;      // "div", "p", "span", ...
  readonly action: TraversalAction;
  readonly depth: number;    // kedalaman node di tree, root = 0
};

export type TraversalLog = ReadonlyArray<TraversalLogEntry>;

export type DOMNode = {
  readonly id: string;

  readonly tag: string;

  readonly attributes: Readonly<Record<string, string>>;

  readonly children: ReadonlyArray<DOMNode>;

  readonly depth: number;

  readonly innerText?: string;
};

export type ScrapeResponse =
  | {
      readonly success: true;
      readonly domTree: DOMNode;
      readonly maxDepth: number;
    }
  | {
      readonly success: false;
      readonly error: string;
    };

export type SearchResponse = {
  readonly results: ReadonlyArray<DOMNode>;
  readonly traversalLog: TraversalLog;
  readonly stats: Readonly<{
    timeMs: number;
    nodesVisited: number;
  }>;
};