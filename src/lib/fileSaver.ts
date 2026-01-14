/**
 * fileSaver.ts - Helper to save files using File System Access API when available
 * Falls back to the classic anchor-download method when unavailable.
 */

export async function saveBlobToFile(blob: Blob, filename: string, mimeType?: string): Promise<void> {
  // Try File System Access API first
  try {
    // @ts-ignore - showSaveFilePicker is available in Chromium-based browsers
    if (typeof window !== 'undefined' && 'showSaveFilePicker' in window) {
      const opts: any = {
        suggestedName: filename,
        types: [
          {
            description: 'File',
            accept: { [mimeType || 'application/octet-stream']: [`.${filename.split('.').pop()}`] }
          }
        ]
      };
      // @ts-ignore
      const handle = await (window as any).showSaveFilePicker(opts);
      const writable = await handle.createWritable();
      await writable.write(blob);
      await writable.close();
      return;
    }
  } catch (err) {
    // If the user cancels or API not available/allowed, we'll fall back to download
    // If it's an AbortError (user cancelled), rethrow so callers can handle if needed
    if (err && typeof err === 'object' && (err as any).name === 'AbortError') {
      throw err;
    }
    // Otherwise, continue to fallback
    console.warn('File System Access API failed or unavailable, falling back to download', err);
  }

  // Fallback: use anchor download (still prompts user in most browsers)
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  // Append to body to make it work in some environments
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 100);
}
