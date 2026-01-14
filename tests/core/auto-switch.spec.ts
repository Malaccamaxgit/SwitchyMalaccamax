import { describe, it, expect } from 'vitest';
import { PacCompiler } from '@/core/pac/pac-generator';
import type { Profile } from '@/core/schema';
import * as vm from 'vm';

describe('Auto Switch Integration', () => {
  it('should route *.indemo.io to Squid Route via auto switch', (): void => {
    const profiles: Profile[] = [
      {
        name: 'Direct',
        profileType: 'DirectProfile',
        color: 'gray'
      },
      {
        name: 'Squid Route',
        profileType: 'FixedProfile',
        color: 'blue',
        fallbackProxy: { scheme: 'http', host: '192.168.50.30', port: 8213 }
      },
      {
        name: 'Auto',
        profileType: 'SwitchProfile',
        color: 'purple',
        defaultProfileName: 'Direct',
        rules: [
          { condition: { conditionType: 'HostWildcardCondition', pattern: '*.indemo.io' }, profileName: 'Squid Route' }
        ]
      }
    ];

    const compiler = new PacCompiler(profiles);
    const pac = compiler.compilePacScript('Auto');

    // Execute the generated PAC script in a small VM to get the FindProxyForURL function
    // Replace isInNet and other helpers with simple mocks if necessary
    const sandbox: Record<string, unknown> & { isInNet?: (...args: unknown[]) => boolean; FindProxyForURL?: (url: string, host: string) => string } = {};
    // Provide a minimal isInNet implementation to avoid ReferenceError
    sandbox.isInNet = (): boolean => false;
    vm.createContext(sandbox as unknown as Record<string, unknown>);

    // Run the PAC script to populate FindProxyForURL
    vm.runInContext(pac + '\nglobalThis.FindProxyForURL = FindProxyForURL;', sandbox as unknown as Record<string, unknown>);

    const find = sandbox.FindProxyForURL as ((url: string, host: string) => string) | undefined;
    expect(find).toBeDefined();

    const result = find!('https://cdt.indemo.io/deployment-assistant', 'cdt.indemo.io');

    expect(result).toContain('PROXY 192.168.50.30:8213');
  });
});