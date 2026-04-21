import { ScraperError } from "../types/error.js";

const SCRAPER_HEADERS = {
    "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64)  AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml",
    "Accept-Language": "en-US,en;q=0.9",
} as const;

function isValidURL(url : string): boolean {
    try {
        const parsed = new URL(url); // cek url
        return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch {
        return false;
    }
}

export async function scrapeURL(url: string): Promise <string> 
{
    if (!isValidURL(url)) throw new Error(ScraperError.INVALID_URL);
    
    let response : Response;

    try {
        response = await fetch(url, {
            headers: SCRAPER_HEADERS,
            signal: AbortSignal.timeout(10000),
        });
    } catch (err) {
        if (err instanceof DOMException && err.name === "TimeoutError"){
            throw new Error(ScraperError.TIMEOUT);
        }
        throw new Error(ScraperError.UNREACHABLE);
    }

    if (!response.ok) throw new Error(ScraperError.HTTP_ERROR(response.status));
            
    const html = await response.text();

    return html;
}
