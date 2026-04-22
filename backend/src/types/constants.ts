export const ScraperError = {
    INVALID_URL: "URL tidak valid. Pastikan dimulai dengan http:// atau https://",
    TIMEOUT: "Koneksi timeout.",
    UNREACHABLE: "Website tidak bisa diakses.",
    HTTP_ERROR: (status: number) => 'HTTP Error: Server mengembalikan status ${status}',
    NETWORK_ERROR: (status: string) => 'Network Error: Server mengembalikan status ${status}',
} as const;

export const ParserError = {
    EMPTY_HTML: "",
    PARSE_FAILED: "",
} as const;

export const RequestError = {
    MISSING_FIELD: (filed: string) => 'Field "${field}" tidak boleh kosong.',
    INVALID_ALGORITHM: "...",
} as const;