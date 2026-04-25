// Error khusus untuk selector tidak valid atau tidak didukung.
// Semua jalur kegagalan dari parser / tokenizer selector melempar error ini.

export class SelectorError extends Error {
  constructor(
    message: string,
    public readonly selector: string,
    public readonly position?: number
  ) {
    const locationHint =
      position !== undefined ? ` (at position ${position})` : "";
    super(`Invalid selector "${selector}"${locationHint}: ${message}`);
    this.name = "SelectorError";
  }
}