import express, { type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import { scrapeURL } from "./scraper/scraper.js";
import { parseHTML } from "./parser/parser.js";
import { bfsSearch } from "./algorithm/bfs.js";
import { dfsSearch } from "./algorithm/dfs.js";
import { SelectorError } from "./utils/selectorError.js";
import type { DOMNode } from "./types/dom.js";
import { error } from "node:console";

const app = express();
const PORT = process.env.PORT ?? 3000;

app.use(cors());
app.use(express.json({ limit: "10mb" })); //payload

//POST /api/scrape
app.post("/api/scrape", async (req, res, next) => {
    try {
        const { inputType, input } = req.body as {
            inputType?: unknown;
            input?: unknown;
        };

        if (inputType !== "url" && inputType !== "html") {
            res.status(400).json({ error: 'inputType harus url atau html.' })
            return;
        }

        if (typeof input !== "string" || input.trim() === "") {
            res.status(400).json({ error: 'input harus bertipe string tidak kosong.' });
            return;
        }

        const html = inputType === "url" ? await scrapeURL(input) : input;
        const { domTree, maxDepth } = parseHTML(html);

        res.json({ domTree, maxDepth });
    } catch (err) {
        next(err);
    }
});

//POST /api/search
app.post("/api/search", (req: Request, res: Response, next: NextFunction) => {
    try {
        const { domTree, algorithm, selector, limit } = req.body as {
            domTree?: unknown;
            algorithm?: unknown;
            selector?: unknown;
            limit?: unknown;
        };

        if (
            typeof domTree !== "object" ||
            domTree === null ||
            typeof (domTree as Record<string, unknown>).tag !== "string"
        ) {
            res.status(400).json({ error: 'Field "domTree" must be a valid DOM node.' });
            return;
        }

        if (algorithm !== "bfs" && algorithm !== "dfs") {
            res.status(400).json({ error: 'Field "algorithm" must be "bfs" or "dfs".' });
            return;
        }

        if (typeof selector !== "string" || selector.trim() === "") {
            res.status(400).json({ error: 'Field "selector" must be a non-empty string.' });
            return;
        }

        if (limit !== "all" && (typeof limit !== "number" || !Number.isInteger(limit) || limit < 1)) {
            res.status(400).json({ error: 'Field "limit" must be a positive integer or "all".' });
            return;
        }

        const root = domTree as DOMNode;
        const result =
            algorithm === "bfs"
                ? bfsSearch(root, selector, limit)
                : dfsSearch(root, selector, limit);

        res.json(result);
    } catch (err) {
        next(err);
    }
});

// error handler

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof SelectorError) {
        res.status(400).json({ error: err.message });
        return;
    }

    if (err instanceof Error) {
        res.status(500).json({ error: err.message });
        return;
    }

    res.status(500).json({ error: "An unexpected error occurred." });
});


app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

export default app;

