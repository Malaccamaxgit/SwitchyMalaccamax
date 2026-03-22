/**
 * fileSaver.ts - Helper to save files using File System Access API when available
 * Falls back to the classic anchor-download method when unavailable.
 */

import { isAbortError } from '@/lib/utils';

type SaveFilePickerOptions = {
  suggestedName?: string;
  types?: Array<{ description: string; accept: Record<string, string[]> }>;
};

type FileSystemWritable = {
  write: (data: Blob) => Promise<void>;
  close: () => Promise<void>;
};

type FileSystemFileHandleLike = {
  createWritable: () => Promise<FileSystemWritable>;
};

function getShowSaveFilePicker():
  | ((options?: SaveFilePickerOptions) => Promise<FileSystemFileHandleLike>)
  | undefined {
  if (typeof window !== 'undefined' && 'showSaveFilePicker' in window) {
    return (window as Window & { showSaveFilePicker: (o?: SaveFilePickerOptions) => Promise<FileSystemFileHandleLike> })
      .showSaveFilePicker;
  }
  if ('showSaveFilePicker' in globalThis) {
    return (globalThis as unknown as { showSaveFilePicker: (o?: SaveFilePickerOptions) => Promise<FileSystemFileHandleLike> })
      .showSaveFilePicker;
  }
  return undefined;
}

export async function saveBlobToFile(blob: Blob, filename: string, mimeType?: string): Promise<void> {
  try {
    const picker = getShowSaveFilePicker();
    if (picker) {
      const ext = filename.includes('.') ? `.${filename.split('.').pop()}` : '';
      const opts: SaveFilePickerOptions = {
        suggestedName: filename,
        types: [
          {
            description: 'File',
            accept: { [mimeType || 'application/octet-stream']: ext ? [ext] : ['.*'] },
          },
        ],
      };
      const handle = await picker(opts);
      const writable = await handle.createWritable();
      await writable.write(blob);
      await writable.close();
      return;
    }
  } catch (err) {
    if (isAbortError(err)) {
      throw err;
    }
    console.warn('File System Access API failed or unavailable, falling back to download', err);
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 100);
}
