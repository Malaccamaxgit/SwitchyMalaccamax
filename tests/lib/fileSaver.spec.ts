import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Note: Tests will run in node; we need to simulate window.showSaveFilePicker

describe('fileSaver', () => {
  let originalShowSave: any;

  beforeEach(() => {
    originalShowSave = (global as any).showSaveFilePicker;
  });

  afterEach(() => {
    (global as any).showSaveFilePicker = originalShowSave;
    vi.restoreAllMocks();
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