POST /api/search

Request Body:
{
  "input": "https://example.com" | "<html>...</html>",
  "inputType": "url" | "html",
  "algorithm": "bfs" | "dfs",
  "selector": "div.container > p",
  "limit": number | "all"
}

Response:
{
  "domTree": { ...node structure... },
  "results": [ ...matched nodes... ],
  "traversalLog": [ ...ordered visited nodes... ],
  "stats": {
    "timeMs": number,
    "nodesVisited": number
  }
}