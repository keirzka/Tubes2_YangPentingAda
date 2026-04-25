## Endpoint 1: POST /api/scrape
Scrape URL atau parse raw HTML, kembalikan DOM tree.

Request:
{
  "inputType": "url" | "html",
  "input": string
}

Response (sukses):
{
  "success": true,
  "domTree": DOMNode,
  "maxDepth": number
}

Response (gagal):
{
  "success": false,
  "error": "timeout" | "unreachable" | "HTTP 403" | string
}

---

## Endpoint 2: POST /api/search
Terima DOM tree + query parameter, kembalikan hasil penelusuran.

Request:
{
  "domTree": DOMNode,
  "algorithm": "bfs" | "dfs",
  "selector": string,
  "limit": number | "all"
}

Response:
{
  "results": DOMNode[],
  "traversalLog": TraversalLog,
  "stats": {
    "timeMs": number,
    "nodesVisited": number
  }
}

---

## Shared Types

type DOMNode = {
  id: string                         // "html/body/div[1]/p[0]"
  tag: string                        // "div", "p", "span", ...
  attributes: Record<string, string> // { class: "box", id: "main" }
  children: DOMNode[]
  depth: number
  innerText?: string
}

type TraversalLog = {
  step: number
  nodeId: string
  tag: string
  action: "visit" | "match" | "skip"
  depth: number
}[]