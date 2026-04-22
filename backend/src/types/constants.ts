export const ScraperError = {
    INVALID_URL: "URL tidak valid. Pastikan dimulai dengan http:// atau https://",
    TIMEOUT: "Koneksi timeout.",
    UNREACHABLE: "URL tidak bisa diakses.",
    HTTP_ERROR: (status: number) => `HTTP Error: Server mengembalikan status ${status}`,
    NETWORK_ERROR: (status: string) => `Network Error: Server mengembalikan status ${status}`,
} as const;

export const ParserError = {
    EMPTY_HTML: "HTML kosong.",
    PARSE_FAILED: "Parsing HTML tidak berhasil.",
} as const;

export const RequestError = {
    MISSING_FIELD: (field: string) => `Field "${field}" tidak boleh kosong.`,
    INVALID_ALGORITHM: "...",
} as const;