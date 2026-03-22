import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock OffscreenCanvas for icon generation
class MockOffscreenCanvas {
  constructor(public width: number, public height: number) {}
  getContext() {
    return {
      clearRect: vi.fn(),
      beginPath: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
      stroke: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      strokeStyle: '',
      lineWidth: 0,
      lineCap: 'round',
      lineJoin: 'round',
      getImageData: vi.fn().mockReturnValue({ data: new Uint8ClampedArray(4) }),
    };
  }
}

// Complete chrome mock with all required APIs
const mockChrome = {
  runtime: {
    id: 'test-extension-id',
    onMessage: {
      addListener: vi.fn(),
    },
    onInstalled: {
      addListener: vi.fn(),
    },
    onSuspend: {
      addListener: vi.fn(),
    },
  },
  storage: {
    sync: {
      get: vi.fn().mockResolvedValue({}),
      set: vi.fn(),
    },
    local: {
      get: vi.fn().mockResolvedValue({ logLevel: 1, logMaxLines: 1000 }),
      set: vi.fn(),
    },
  },
  proxy: {
    settings: {
      get: vi.fn().mockResolvedValue({ levelOfControl: 'controllable_by_this_extension' }),
      set: vi.fn(),
      onChange: {
        addListener: vi.fn(),
      },
    },
  },
  action: {
    setBadgeText: vi.fn(),
    setBadgeBackgroundColor: vi.fn(),
    setTitle: vi.fn(),
    setIcon: vi.fn(),
  },
};

// Setup global mocks before each test
beforeEach(() => {
  (global as any).chrome = mockChrome;
  (global as any).OffscreenCanvas = MockOffscreenCanvas;
  vi.clearAllMocks();
});

afterEach(() => {
  delete (global as any).chrome;
  delete (global as any).OffscreenCanvas;
});

describe('Service Worker - checkProxyConflicts', () => {
  it('should detect conflict with another extension', async () => {
    mockChrome.proxy.settings.get.mockResolvedValue({
      levelOfControl: 'controlled_by_other_extensions',
    });

    vi.resetModules();
    const sw = await import('@/background/service-worker');
    await sw.checkProxyConflicts();

    expect(mockChrome.action.setBadgeText).toHaveBeenCalledWith({ text: '!' });
    expect(mockChrome.action.setBadgeBackgroundColor).toHaveBeenCalledWith({
      color: '#DC2626',
    });
    expect(mockChrome.action.setTitle).toHaveBeenCalledWith({
      title: 'SwitchyMalaccamax - Conflict: Another extension has higher priority',
    });
  });

  it('should show warning when proxy is not controllable', async () => {
    mockChrome.proxy.settings.get.mockResolvedValue({
      levelOfControl: 'not_controllable',
    });

    vi.resetModules();
    const sw = await import('@/background/service-worker');
    await sw.checkProxyConflicts();

    expect(mockChrome.action.setBadgeText).toHaveBeenCalledWith({ text: '?' });
    expect(mockChrome.action.setBadgeBackgroundColor).toHaveBeenCalledWith({
      color: '#F59E0B',
    });
    expect(mockChrome.action.setTitle).toHaveBeenCalledWith({
      title: 'SwitchyMalaccamax - Warning: Proxy cannot be controlled',
    });
  });

  it('should clear badge when extension has control', async () => {
    mockChrome.proxy.settings.get.mockResolvedValue({
      levelOfControl: 'controlled_by_this_extension',
    });

    vi.resetModules();
    const sw = await import('@/background/service-worker');
    await sw.checkProxyConflicts();

    expect(mockChrome.action.setBadgeText).toHaveBeenCalledWith({ text: '' });
    expect(mockChrome.action.setBadgeBackgroundColor).toHaveBeenCalledWith({
      color: [0, 0, 0, 0],
    });
    expect(mockChrome.action.setTitle).toHaveBeenCalledWith({
      title: 'SwitchyMalaccamax - Proxy Switcher',
    });
  });

  it('should clear badge when proxy is controllable', async () => {
    mockChrome.proxy.settings.get.mockResolvedValue({
      levelOfControl: 'controllable_by_this_extension',
    });

    vi.resetModules();
    const sw = await import('@/background/service-worker');
    await sw.checkProxyConflicts();

    expect(mockChrome.action.setBadgeText).toHaveBeenCalledWith({ text: '' });
    expect(mockChrome.action.setBadgeBackgroundColor).toHaveBeenCalledWith({
      color: [0, 0, 0, 0],
    });
    expect(mockChrome.action.setTitle).toHaveBeenCalledWith({
      title: 'SwitchyMalaccamax - Proxy Switcher',
    });
  });

  it('should handle errors gracefully', async () => {
    mockChrome.proxy.settings.get.mockRejectedValue(new Error('Failed to get proxy settings'));

    vi.resetModules();
    const sw = await import('@/background/service-worker');
    await sw.checkProxyConflicts();

    // Should not throw - error is logged but handled gracefully
    expect(mockChrome.action.setBadgeText).not.toHaveBeenCalled();
  });
});

describe('Service Worker - Message Validation', () => {
  it('should reject messages from unknown senders', async () => {
    const messageListener = vi.fn();
    mockChrome.runtime.onMessage.addListener.mockImplementation((cb) => {
      messageListener.mockImplementation(cb);
    });

    vi.resetModules();
    await import('@/background/service-worker');

    const mockMessage = { action: 'setProxy', config: { mode: 'direct' } };
    const mockSender = { id: 'unknown-extension-id' };
    const mockSendResponse = vi.fn();

    messageListener(mockMessage, mockSender, mockSendResponse);

    expect(mockSendResponse).toHaveBeenCalledWith({
      success: false,
      error: 'Invalid sender',
    });
  });

  it('should reject messages with unknown actions', async () => {
    const messageListener = vi.fn();
    mockChrome.runtime.onMessage.addListener.mockImplementation((cb) => {
      messageListener.mockImplementation(cb);
    });

    vi.resetModules();
    await import('@/background/service-worker');

    const mockMessage = { action: 'unknownAction' };
    const mockSender = { id: mockChrome.runtime.id };
    const mockSendResponse = vi.fn();

    messageListener(mockMessage, mockSender, mockSendResponse);

    expect(mockSendResponse).toHaveBeenCalledWith({
      success: false,
      error: 'Unknown action',
    });
  });

  it('should reject invalid proxy config', async () => {
    const messageListener = vi.fn();
    mockChrome.runtime.onMessage.addListener.mockImplementation((cb) => {
      messageListener.mockImplementation(cb);
    });

    vi.resetModules();
    await import('@/background/service-worker');

    const mockMessage = {
      action: 'setProxy',
      config: { mode: 'invalid_mode' },
    };
    const mockSender = { id: mockChrome.runtime.id };
    const mockSendResponse = vi.fn();

    messageListener(mockMessage, mockSender, mockSendResponse);

    expect(mockSendResponse).toHaveBeenCalledWith({
      success: false,
      error: 'Invalid proxy configuration',
    });
  });

  it('should reject fixed_servers with invalid port', async () => {
    const messageListener = vi.fn();
    mockChrome.runtime.onMessage.addListener.mockImplementation((cb) => {
      messageListener.mockImplementation(cb);
    });

    vi.resetModules();
    await import('@/background/service-worker');

    const mockMessage = {
      action: 'setProxy',
      config: {
        mode: 'fixed_servers',
        rules: {
          singleProxy: { scheme: 'http', host: '127.0.0.1', port: 70000 },
        },
      },
    };
    const mockSender = { id: mockChrome.runtime.id };
    const mockSendResponse = vi.fn();

    messageListener(mockMessage, mockSender, mockSendResponse);

    expect(mockSendResponse).toHaveBeenCalledWith({
      success: false,
      error: 'Invalid proxy configuration',
    });
  });

  it('should reject invalid color', async () => {
    const messageListener = vi.fn();
    mockChrome.runtime.onMessage.addListener.mockImplementation((cb) => {
      messageListener.mockImplementation(cb);
    });

    vi.resetModules();
    await import('@/background/service-worker');

    const mockMessage = {
      action: 'setProxy',
      config: { mode: 'direct' },
      profileColor: 'invalid_color',
    };
    const mockSender = { id: mockChrome.runtime.id };
    const mockSendResponse = vi.fn();

    messageListener(mockMessage, mockSender, mockSendResponse);

    expect(mockSendResponse).toHaveBeenCalledWith({
      success: false,
      error: 'Invalid color',
    });
  });
});
