/** Triggers a browser download for a blob or text file. */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = 'noopener';
  anchor.style.display = 'none';
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1500);
}

export function downloadText(text: string, filename: string, type = 'application/json'): void {
  downloadBlob(new Blob([text], { type: `${type};charset=utf-8` }), filename);
}

export function datedFilename(base: string, extension: string): string {
  const date = new Date().toISOString().slice(0, 10);
  return `${base}-${date}.${extension}`;
}
