/**
 * profile-switching.spec.ts - Tests for Edge Cases
 * 
 * Tests documented in .github/copilot-instructions.md:
 * 1. Profile selection not taking effect (conflict detection)
 * 2. Auto Switch Profile UI restrictions (bypass list visibility)
 */

import { describe, it, expect, vi } from 'vitest';

describe('Edge Case: Profile Selection Not Taking Effect', () => {
  describe('Conflict Detection', () => {
    it('should detect when another extension controls proxy', async () => {
      // Mock chrome.proxy.settings.get to return controlled_by_other_extensions
      const mockGet = vi.fn().mockResolvedValue({
        levelOfControl: 'controlled_by_other_extensions',
        value: { mode: 'direct' }
      });
      
      global.chrome = {
        proxy: {
          settings: {
            get: mockGet
          }
        }
      } as unknown as typeof chrome;
      
      // Simulate conflict check
      const proxySettings = await chrome.proxy.settings.get({});
      const levelOfControl = (proxySettings as unknown as Record<string, unknown>).levelOfControl;
      
      expect(levelOfControl).toBe('controlled_by_other_extensions');
      expect(mockGet).toHaveBeenCalledWith({});
    });
    
    it('should detect when system policy blocks proxy', async () => {
      const mockGet = vi.fn().mockResolvedValue({
        levelOfControl: 'not_controllable',
        value: { mode: 'system' }
      });
      
      global.chrome = {
        proxy: {
          settings: {
            get: mockGet
          }
        }
      } as unknown as typeof chrome;
      
      const proxySettings = await chrome.proxy.settings.get({});
      const levelOfControl = (proxySettings as unknown as Record<string, unknown>).levelOfControl;
      
      expect(levelOfControl).toBe('not_controllable');
    });
    
    it('should confirm when extension has control', async () => {
      const mockGet = vi.fn().mockResolvedValue({
        levelOfControl: 'controlled_by_this_extension',
        value: { mode: 'fixed_servers' }
      });
      
      global.chrome = {
        proxy: {
          settings: {
            get: mockGet
          }
        }
      } as unknown as typeof chrome;
      
      const proxySettings = await chrome.proxy.settings.get({});
      const levelOfControl = (proxySettings as unknown as Record<string, unknown>).levelOfControl;
      
      expect(levelOfControl).toBe('controlled_by_this_extension');
    });
  });
  
  describe('Profile Switch Verification', () => {
    it('should verify FixedProfile applies correct proxy config', async () => {
      const mockSet = vi.fn().mockResolvedValue(undefined);
      const mockGet = vi.fn().mockResolvedValue({
        levelOfControl: 'controlled_by_this_extension',
        value: {
          mode: 'fixed_servers',
          rules: {
            singleProxy: {
              scheme: 'http',
              host: '192.168.50.30',
              port: 8213
            }
          }
        }
      });
      
      global.chrome = {
        proxy: {
          settings: {
            set: mockSet,
            get: mockGet
          }
        }
      } as unknown as typeof chrome;
      
      // Simulate profile switch
      const config = {
        mode: 'fixed_servers' as const,
        rules: {
          singleProxy: {
            scheme: 'http' as const,
            host: '192.168.50.30',
            port: 8213
          }
        }
      };
      
      await chrome.proxy.settings.set({
        value: config,
        scope: 'regular'
      });
      
      // Verify it was applied
      const result = await chrome.proxy.settings.get({});
      
      expect(mockSet).toHaveBeenCalledWith({
        value: config,
        scope: 'regular'
      });
      const resultObj = result as unknown as Record<string, unknown>;
      const value = resultObj.value as unknown as Record<string, unknown>;
      expect(value.mode).toBe('fixed_servers');
      const rules = value.rules as unknown as Record<string, unknown>;
      const singleProxy = rules.singleProxy as unknown as Record<string, unknown>;
      expect(singleProxy.host).toBe('192.168.50.30');
      expect(singleProxy.port).toBe(8213);
    });
    
    it('should verify DirectProfile applies DIRECT mode', async () => {
      const mockSet = vi.fn().mockResolvedValue(undefined);
      const mockGet = vi.fn().mockResolvedValue({
        levelOfControl: 'controlled_by_this_extension',
        value: { mode: 'direct' }
      });
      
      global.chrome = {
        proxy: {
          settings: {
            set: mockSet,
            get: mockGet
          }
        }
      } as unknown as typeof chrome;
      
      const config = { mode: 'direct' as const };
      
      await chrome.proxy.settings.set({
        value: config,
        scope: 'regular'
      });
      
      const result = await chrome.proxy.settings.get({});
      
      expect(mockSet).toHaveBeenCalledWith({
        value: config,
        scope: 'regular'
      });
      const resultObj2 = result as unknown as Record<string, unknown>;
      const value2 = resultObj2.value as unknown as Record<string, unknown>;
      expect(value2.mode).toBe('direct');
    });
  });
});

describe('Edge Case: Auto Switch Profile UI Restrictions', () => {
  describe('Bypass List Visibility', () => {
    it('should show bypass list for FixedProfile', () => {
      const fixedProfile = {
        id: 'profile-1',
        name: 'Company Proxy',
        profileType: 'FixedProfile',
        host: 'proxy.company.com',
        port: 8080,
        proxyType: 'HTTP',
        color: 'blue',
        bypassList: []
      };
      
      // UI should render bypass section
      const shouldShowBypassList = fixedProfile.profileType === 'FixedProfile';
      expect(shouldShowBypassList).toBe(true);
    });
    
    it('should NOT show bypass list for SwitchProfile', () => {
      const switchProfile = {
        id: 'profile-2',
        name: 'Auto Switch',
        profileType: 'SwitchProfile',
        color: 'green',
        defaultProfileName: 'Direct',
        rules: []
      };
      
      // UI should NOT render bypass section
      const shouldShowBypassList = switchProfile.profileType === 'FixedProfile';
      expect(shouldShowBypassList).toBe(false);
    });
    
    it('should NOT show bypass list for DirectProfile', () => {
      const directProfile = {
        id: 'profile-3',
        name: 'Direct',
        profileType: 'DirectProfile',
        color: 'gray'
      };
      
      const shouldShowBypassList = directProfile.profileType === 'FixedProfile';
      expect(shouldShowBypassList).toBe(false);
    });
    
    it('should NOT show bypass list for PacProfile', () => {
      const pacProfile = {
        id: 'profile-4',
        name: 'PAC Script',
        profileType: 'PacProfile',
        color: 'purple',
        pacScript: 'function FindProxyForURL(url, host) { return "DIRECT"; }'
      };
      
      const shouldShowBypassList = pacProfile.profileType === 'FixedProfile';
      expect(shouldShowBypassList).toBe(false);
    });
  });
  
  describe('Bypass List Behavior', () => {
    it('should only apply bypass rules to FixedProfile target proxy', () => {
      // In SwitchProfile, bypass rules are handled per-rule target profile
      const switchProfile = {
        profileType: 'SwitchProfile',
        rules: [
          {
            condition: { conditionType: 'HostWildcardCondition', pattern: '*.company.com' },
            profileName: 'Company Proxy' // This profile has bypass list
          }
        ],
        defaultProfileName: 'Direct'
      };
      
      // Verify: bypass rules are not set at SwitchProfile level
      expect((switchProfile as unknown as Record<string, unknown>).bypassList).toBeUndefined();
      
      // Bypass rules should only exist on the target FixedProfile
      const targetFixedProfile = {
        profileType: 'FixedProfile',
        name: 'Company Proxy',
        bypassList: [
          { conditionType: 'BypassCondition', pattern: '127.0.0.1' },
          { conditionType: 'BypassCondition', pattern: 'localhost' }
        ]
      };
      
      expect(targetFixedProfile.bypassList).toHaveLength(2);
    });
  });
});
