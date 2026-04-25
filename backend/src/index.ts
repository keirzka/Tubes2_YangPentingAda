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
app.post("/api/scrape", async (req: Request, res: Response, next: NextFunction) => {
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