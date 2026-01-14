import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Note: Tests will run in node; we need to simulate window.showSaveFilePicker

describe('fileSaver', () => {
  let originalShowSave: any;

  beforeEach(() => {
    originalShowSave = (global as any).showSaveFilePicker;
    // Provide a minimal document for the fallback path tests
    (global as any).document = (global as any).document || {
      createElement: () => ({ href: '', download: '', click: () => {}, style: {}, setAttribute: () => {}, remove: () => {} }),
      body: { appendChild: () => {}, removeChild: () => {} }
    };
  });

  afterEach(() => {
    (global as any).showSaveFilePicker = originalShowSave;
    vi.restoreAllMocks();
    // Clean up document stub
    // @ts-ignore
    if ((global as any).document && (global as any).document.createElement && (global as any).document.createElement.toString().includes('native code')) {
      // leave real document
    } else {
      delete (global as any).document;
    }
  });

  it('should use showSaveFilePicker when available', async () => {
    const handle = {
      createWritable: vi.fn(async () => ({ write: vi.fn(), close: vi.fn() }))
    };
    (global as any).showSaveFilePicker = vi.fn(async () => handle);

    const { saveBlobToFile } = await import('@/lib/fileSaver');
    const b = new Blob(['test'], { type: 'text/plain' });

    await expect(saveBlobToFile(b, 'test.txt', 'text/plain')).resolves.toBeUndefined();
    expect((global as any).showSaveFilePicker).toHaveBeenCalled();
  });

  it('should fallback to anchor when picker not available', async () => {
    (global as any).showSaveFilePicker = undefined;
    // Mock DOM anchor click flow
    const clickMock = vi.fn();
    const createElementSpy = vi.spyOn(document, 'createElement');
    createElementSpy.mockImplementation(() => ({ href: '', download: '', click: clickMock, style: {}, setAttribute: vi.fn(), remove: vi.fn() } as any));

    const { saveBlobToFile } = await import('@/lib/fileSaver');
    const b = new Blob(['test'], { type: 'text/plain' });

    await expect(saveBlobToFile(b, 'test.txt', 'text/plain')).resolves.toBeUndefined();
    expect(clickMock).toHaveBeenCalled();

    createElementSpy.mockRestore();
  });
});