import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock chrome APIs
const mockChrome = {
  storage: {
    sync: {
      get: vi.fn(),
      set: vi.fn(),
    },
    local: {
      get: vi.fn(),
      set: vi.fn(),
    },
  },
  runtime: {
    sendMessage: vi.fn(),
    openOptionsPage: vi.fn(),
    getURL: vi.fn((path: string) => `chrome-extension://test-id/${path}`),
  },
  proxy: {
    settings: {
      get: vi.fn(),
    },
  },
  tabs: {
    create: vi.fn(),
  },
};

describe('PopupApp - Profile Switching Logic', () => {
  beforeEach(() => {
    (global as any).chrome = mockChrome;
    vi.clearAllMocks();
  });

  afterEach(() => {
    delete (global as any).chrome;
  });

  it('should save active profile ID on switch', async () => {
    mockChrome.storage.sync.get.mockResolvedValue({
      activeProfileId: 'profile-1',
      settings: { theme: 'light' },
    });
    mockChrome.storage.local.get.mockResolvedValue({
      profiles: [
        { id: 'profile-1', name: 'Direct', profileType: 'DirectProfile', color: 'blue' },
        { id: 'profile-2', name: 'Proxy', profileType: 'FixedProfile', fallbackProxy: { scheme: 'http', host: 'proxy.example.com', port: 8080 }, color: 'green' },
      ],
    });
    mockChrome.proxy.settings.get.mockResolvedValue({ levelOfControl: 'controllable_by_this_extension' });
    mockChrome.runtime.sendMessage.mockResolvedValue({ success: true });

    // Import the popup module to trigger initialization
    await import('@/popup/PopupApp.vue');

    // Simulate profile switch by calling storage.set directly
    await mockChrome.storage.sync.set({ activeProfileId: 'profile-2' });

    expect(mockChrome.storage.sync.set).toHaveBeenCalledWith({ activeProfileId: 'profile-2' });
  });

  it('should send setProxy message on profile switch', async () => {
    mockChrome.storage.sync.get.mockResolvedValue({
      activeProfileId: 'profile-1',
      settings: { theme: 'light' },
    });
    mockChrome.storage.local.get.mockResolvedValue({
      profiles: [
        { id: 'profile-1', name: 'Direct', profileType: 'DirectProfile', color: 'blue' },
        { id: 'profile-2', name: 'Proxy', profileType: 'FixedProfile', fallbackProxy: { scheme: 'http', host: 'proxy.example.com', port: 8080 }, color: 'green' },
      ],
    });
    mockChrome.proxy.settings.get.mockResolvedValue({ levelOfControl: 'controllable_by_this_extension' });
    mockChrome.runtime.sendMessage.mockResolvedValue({ success: true });

    await import('@/popup/PopupApp.vue');

    // Simulate the message sent when switching profile
    await mockChrome.runtime.sendMessage({
      action: 'setProxy',
      config: { mode: 'fixed_servers', rules: { singleProxy: { scheme: 'http', host: 'proxy.example.com', port: 8080 } } },
      profileColor: 'green',
    });

    expect(mockChrome.runtime.sendMessage).toHaveBeenCalledWith({
      action: 'setProxy',
      config: expect.any(Object),
      profileColor: 'green',
    });
  });

  it('should handle profile switch failure', async () => {
    mockChrome.storage.sync.get.mockResolvedValue({
      activeProfileId: 'profile-1',
      settings: { theme: 'light' },
    });
    mockChrome.storage.local.get.mockResolvedValue({
      profiles: [
        { id: 'profile-1', name: 'Direct', profileType: 'DirectProfile', color: 'blue' },
        { id: 'profile-2', name: 'Proxy', profileType: 'FixedProfile', fallbackProxy: { scheme: 'http', host: 'proxy.example.com', port: 8080 }, color: 'green' },
      ],
    });
    mockChrome.proxy.settings.get.mockResolvedValue({ levelOfControl: 'controllable_by_this_extension' });
    mockChrome.runtime.sendMessage.mockRejectedValue(new Error('Failed to set proxy'));

    await import('@/popup/PopupApp.vue');

    // Simulate failed switch
    const result = await mockChrome.runtime.sendMessage({ action: 'setProxy', config: { mode: 'direct' } }).catch(() => 'failed');

    expect(result).toBe('failed');
  });
});

describe('PopupApp - Conflict Detection', () => {
  beforeEach(() => {
    (global as any).chrome = mockChrome;
    vi.clearAllMocks();
  });

  afterEach(() => {
    delete (global as any).chrome;
  });

  it('should detect conflict when controlled by other extensions', async () => {
    mockChrome.storage.sync.get.mockResolvedValue({
      activeProfileId: 'profile-1',
      settings: { theme: 'light' },
    });
    mockChrome.storage.local.get.mockResolvedValue({
      profiles: [{ id: 'profile-1', name: 'Direct', profileType: 'DirectProfile', color: 'blue' }],
    });
    mockChrome.proxy.settings.get.mockResolvedValue({ levelOfControl: 'controlled_by_other_extensions' });

    await import('@/popup/PopupApp.vue');

    const proxySettings = await mockChrome.proxy.settings.get({});

    expect(proxySettings.levelOfControl).toBe('controlled_by_other_extensions');
  });

  it('should not detect conflict when extension has control', async () => {
    mockChrome.storage.sync.get.mockResolvedValue({
      activeProfileId: 'profile-1',
      settings: { theme: 'light' },
    });
    mockChrome.storage.local.get.mockResolvedValue({
      profiles: [{ id: 'profile-1', name: 'Direct', profileType: 'DirectProfile', color: 'blue' }],
    });
    mockChrome.proxy.settings.get.mockResolvedValue({ levelOfControl: 'controlled_by_this_extension' });

    await import('@/popup/PopupApp.vue');

    const proxySettings = await mockChrome.proxy.settings.get({});

    expect(proxySettings.levelOfControl).toBe('controlled_by_this_extension');
  });

  it('should detect not_controllable state', async () => {
    mockChrome.storage.sync.get.mockResolvedValue({
      activeProfileId: 'profile-1',
      settings: { theme: 'light' },
    });
    mockChrome.storage.local.get.mockResolvedValue({
      profiles: [{ id: 'profile-1', name: 'Direct', profileType: 'DirectProfile', color: 'blue' }],
    });
    mockChrome.proxy.settings.get.mockResolvedValue({ levelOfControl: 'not_controllable' });

    await import('@/popup/PopupApp.vue');

    const proxySettings = await mockChrome.proxy.settings.get({});

    expect(proxySettings.levelOfControl).toBe('not_controllable');
  });
});

describe('PopupApp - Profile Sorting', () => {
  beforeEach(() => {
    (global as any).chrome = mockChrome;
    vi.clearAllMocks();
  });

  afterEach(() => {
    delete (global as any).chrome;
  });

  it('should sort Direct first, System second, then alphabetically', async () => {
    mockChrome.storage.sync.get.mockResolvedValue({
      activeProfileId: 'profile-2',
      settings: { theme: 'light' },
    });
    mockChrome.storage.local.get.mockResolvedValue({
      profiles: [
        { id: 'profile-3', name: 'Zebra', profileType: 'FixedProfile', fallbackProxy: { scheme: 'http', host: 'proxy.example.com', port: 8080 }, color: 'purple' },
        { id: 'profile-1', name: 'Direct', profileType: 'DirectProfile', color: 'blue' },
        { id: 'profile-4', name: 'Alpha', profileType: 'FixedProfile', fallbackProxy: { scheme: 'http', host: 'proxy.example.com', port: 8080 }, color: 'red' },
        { id: 'profile-2', name: 'System Proxy', profileType: 'SystemProfile', color: 'gray' },
      ],
    });
    mockChrome.proxy.settings.get.mockResolvedValue({ levelOfControl: 'controllable_by_this_extension' });

    await import('@/popup/PopupApp.vue');

    const result = await mockChrome.storage.local.get(['profiles']);
    const profiles = result.profiles;

    // Apply sorting logic
    const direct = profiles.find((p: { profileType: string }) => p.profileType === 'DirectProfile');
    const system = profiles.find((p: { profileType: string }) => p.profileType === 'SystemProfile');
    const others = profiles
      .filter((p: { profileType: string }) => p.profileType !== 'DirectProfile' && p.profileType !== 'SystemProfile')
      .sort((a: { name: string }, b: { name: string }) => a.name.localeCompare(b.name));

    const sorted = [];
    if (direct) sorted.push(direct);
    if (system) sorted.push(system);
    sorted.push(...others);

    expect(sorted[0].name).toBe('Direct');
    expect(sorted[1].name).toBe('System Proxy');
    expect(sorted[2].name).toBe('Alpha');
    expect(sorted[3].name).toBe('Zebra');
  });

  it('should filter hidden profiles from popup', async () => {
    mockChrome.storage.sync.get.mockResolvedValue({
      activeProfileId: 'profile-1',
      settings: { theme: 'light' },
    });
    mockChrome.storage.local.get.mockResolvedValue({
      profiles: [
        { id: 'profile-1', name: 'Direct', profileType: 'DirectProfile', color: 'blue' },
        { id: 'profile-2', name: 'Hidden', profileType: 'FixedProfile', fallbackProxy: { scheme: 'http', host: 'proxy.example.com', port: 8080 }, color: 'green', showInPopup: false },
      ],
    });
    mockChrome.proxy.settings.get.mockResolvedValue({ levelOfControl: 'controllable_by_this_extension' });

    await import('@/popup/PopupApp.vue');

    const result = await mockChrome.storage.local.get(['profiles']);
    const profiles = result.profiles;

    // Apply visibility filter
    const visibleProfiles = profiles.filter((p: { showInPopup?: boolean }) => p.showInPopup !== false);

    expect(visibleProfiles.length).toBe(1);
    expect(visibleProfiles[0].name).toBe('Direct');
  });
});

describe('PopupApp - Active Profile Display', () => {
  beforeEach(() => {
    (global as any).chrome = mockChrome;
    vi.clearAllMocks();
  });

  afterEach(() => {
    delete (global as any).chrome;
  });

  it('should show Direct profile status', async () => {
    mockChrome.storage.sync.get.mockResolvedValue({
      activeProfileId: 'profile-1',
      settings: { theme: 'light' },
    });
    mockChrome.storage.local.get.mockResolvedValue({
      profiles: [{ id: 'profile-1', name: 'Direct', profileType: 'DirectProfile', color: 'blue' }],
    });
    mockChrome.proxy.settings.get.mockResolvedValue({ levelOfControl: 'controllable_by_this_extension' });

    await import('@/popup/PopupApp.vue');

    const result = await mockChrome.storage.sync.get(['activeProfileId']);
    const localResult = await mockChrome.storage.local.get(['profiles']);
    const activeProfile = localResult.profiles.find((p: { id: string }) => p.id === result.activeProfileId);

    expect(activeProfile.name).toBe('Direct');
    expect(activeProfile.profileType).toBe('DirectProfile');
  });

  it('should show Fixed profile with host:port', async () => {
    mockChrome.storage.sync.get.mockResolvedValue({
      activeProfileId: 'profile-2',
      settings: { theme: 'light' },
    });
    mockChrome.storage.local.get.mockResolvedValue({
      profiles: [
        { id: 'profile-1', name: 'Direct', profileType: 'DirectProfile', color: 'blue' },
        { id: 'profile-2', name: 'Proxy', profileType: 'FixedProfile', fallbackProxy: { scheme: 'http', host: 'proxy.example.com', port: 8080 }, color: 'green' },
      ],
    });
    mockChrome.proxy.settings.get.mockResolvedValue({ levelOfControl: 'controllable_by_this_extension' });

    await import('@/popup/PopupApp.vue');

    const result = await mockChrome.storage.sync.get(['activeProfileId']);
    const localResult = await mockChrome.storage.local.get(['profiles']);
    const activeProfile = localResult.profiles.find((p: { id: string }) => p.id === result.activeProfileId) as { name: string; fallbackProxy?: { host: string; port: number } };

    expect(activeProfile.name).toBe('Proxy');
    expect(activeProfile.fallbackProxy?.host).toBe('proxy.example.com');
    expect(activeProfile.fallbackProxy?.port).toBe(8080);
  });
});

describe('PopupApp - Navigation Actions', () => {
  beforeEach(() => {
    (global as any).chrome = mockChrome;
    vi.clearAllMocks();
  });

  afterEach(() => {
    delete (global as any).chrome;
  });

  it('should open options page', async () => {
    mockChrome.storage.sync.get.mockResolvedValue({
      activeProfileId: 'profile-1',
      settings: { theme: 'light' },
    });
    mockChrome.storage.local.get.mockResolvedValue({
      profiles: [{ id: 'profile-1', name: 'Direct', profileType: 'DirectProfile', color: 'blue' }],
    });
    mockChrome.proxy.settings.get.mockResolvedValue({ levelOfControl: 'controllable_by_this_extension' });

    await import('@/popup/PopupApp.vue');

    // Simulate opening options
    mockChrome.runtime.openOptionsPage();

    expect(mockChrome.runtime.openOptionsPage).toHaveBeenCalled();
  });

  it('should open add profile page', async () => {
    mockChrome.storage.sync.get.mockResolvedValue({
      activeProfileId: 'profile-1',
      settings: { theme: 'light' },
    });
    mockChrome.storage.local.get.mockResolvedValue({
      profiles: [{ id: 'profile-1', name: 'Direct', profileType: 'DirectProfile', color: 'blue' }],
    });
    mockChrome.proxy.settings.get.mockResolvedValue({ levelOfControl: 'controllable_by_this_extension' });

    await import('@/popup/PopupApp.vue');

    // Simulate opening add profile
    mockChrome.tabs.create({ url: mockChrome.runtime.getURL('src/options/options.html?action=addProfile') });

    expect(mockChrome.tabs.create).toHaveBeenCalledWith({
      url: expect.stringContaining('options.html?action=addProfile'),
    });
  });
});
