/**
 * pac-compiler.spec.ts - Tests for PacCompiler
 */
import { describe, it, expect } from 'vitest';
import { PacCompiler, generatePacScript } from '@/core/pac/pac-generator';
describe('PacCompiler', () => {
    describe('DirectProfile', () => {
        it('should generate DIRECT profile', () => {
            const profiles = [
                {
                    name: 'Direct',
                    profileType: 'DirectProfile',
                    color: 'blue'
                }
            ];
            const compiler = new PacCompiler(profiles);
            const result = compiler.compilePacScript('Direct');
            expect(result).toContain('FindProxyForURL');
            expect(result).toContain('"+Direct"');
            expect(result).toContain('return "DIRECT"');
        });
    });
    describe('FixedProfile', () => {
        it('should generate fixed proxy profile', () => {
            const profiles = [
                {
                    name: 'Example',
                    profileType: 'FixedProfile',
                    color: 'green',
                    fallbackProxy: {
                        scheme: 'http',
                        host: '192.168.50.30',
                        port: 8213
                    },
                    bypassList: [
                        { conditionType: 'BypassCondition', pattern: '127.0.0.1' },
                        { conditionType: 'BypassCondition', pattern: 'localhost' },
                        { conditionType: 'BypassCondition', pattern: '192.168.2.0/24' }
                    ]
                }
            ];
            const compiler = new PacCompiler(profiles);
            const result = compiler.compilePacScript('Example');
            expect(result).toContain('PROXY 192.168.50.30:8213');
            expect(result).toContain('127\\.0\\.0\\.1'); // Escaped in regex
            expect(result).toContain('localhost');
            expect(result).toContain('isInNet');
        });
        it('should generate fixed proxy profile with legacy format (host/port)', () => {
            const profiles = [
                {
                    name: 'Example',
                    profileType: 'FixedProfile',
                    color: 'green',
                    proxyType: 'HTTP',
                    host: '192.168.50.30',
                    port: 8213,
                    bypassList: [
                        { conditionType: 'BypassCondition', pattern: '127.0.0.1' },
                        { conditionType: 'BypassCondition', pattern: 'localhost' }
                    ]
                }
            ];
            const compiler = new PacCompiler(profiles);
            const result = compiler.compilePacScript('Example');
            expect(result).toContain('PROXY 192.168.50.30:8213');
            expect(result).toContain('127\\.0\\.0\\.1'); // Escaped in regex
            expect(result).toContain('localhost');
        });
    });
    describe('SwitchProfile', () => {
        it('should generate switch profile with nested references', () => {
            const profiles = [
                {
                    name: 'Direct',
                    profileType: 'DirectProfile',
                    color: 'blue'
                },
                {
                    name: 'Example',
                    profileType: 'FixedProfile',
                    color: 'green',
                    fallbackProxy: {
                        scheme: 'http',
                        host: '192.168.50.30',
                        port: 8213
                    },
                    bypassList: []
                },
                {
                    name: 'Auto Switch',
                    profileType: 'SwitchProfile',
                    color: 'purple',
                    defaultProfileName: 'Direct',
                    rules: [
                        {
                            condition: { conditionType: 'HostWildcardCondition', pattern: 'confluence.example.com' },
                            profileName: 'Example'
                        },
                        {
                            condition: { conditionType: 'HostWildcardCondition', pattern: '*.example.com' },
                            profileName: 'Example'
                        }
                    ]
                }
            ];
            const compiler = new PacCompiler(profiles);
            const result = compiler.compilePacScript('Auto Switch');
            // Should have profiles dictionary
            expect(result).toContain('"+Auto Switch"');
            expect(result).toContain('"+Direct"');
            expect(result).toContain('"+Example"');
            // Should have resolver loop
            expect(result).toContain('do {');
            expect(result).toContain('} while');
            // Should have profile references
            expect(result).toContain('return "+Example"');
            expect(result).toContain('return "+Direct"');
            // Should have actual proxy result
            expect(result).toContain('PROXY 192.168.50.30:8213');
        });
        it('should handle wildcard patterns correctly', () => {
            const profiles = [
                {
                    name: 'Direct',
                    profileType: 'DirectProfile',
                    color: 'blue'
                },
                {
                    name: 'Proxy',
                    profileType: 'FixedProfile',
                    color: 'green',
                    fallbackProxy: {
                        scheme: 'http',
                        host: 'proxy.example.com',
                        port: 8080
                    },
                    bypassList: []
                },
                {
                    name: 'Auto',
                    profileType: 'SwitchProfile',
                    color: 'purple',
                    defaultProfileName: 'Direct',
                    rules: [
                        {
                            condition: { conditionType: 'HostWildcardCondition', pattern: '*.example.com' },
                            profileName: 'Proxy'
                        }
                    ]
                }
            ];
            const compiler = new PacCompiler(profiles);
            const result = compiler.compilePacScript('Auto');
            // Should convert *.example.com to regex that matches subdomains
            expect(result).toContain('(?:^|\\.)example\\.com$');
        });
    });
    describe('Legacy API', () => {
        it('should work with generatePacScript function', () => {
            const profile = {
                name: 'Auto',
                profileType: 'SwitchProfile',
                color: 'purple',
                defaultProfileName: 'Direct',
                rules: []
            };
            const allProfiles = [
                profile,
                {
                    name: 'Direct',
                    profileType: 'DirectProfile',
                    color: 'blue'
                }
            ];
            const result = generatePacScript(profile, allProfiles);
            expect(result).toContain('FindProxyForURL');
            expect(result).toContain('"+Auto"');
        });
    });
    describe('Profile Reference Resolution', () => {
        it('should only include referenced profiles', () => {
            const profiles = [
                {
                    name: 'Direct',
                    profileType: 'DirectProfile',
                    color: 'blue'
                },
                {
                    name: 'Proxy1',
                    profileType: 'FixedProfile',
                    color: 'green',
                    fallbackProxy: { scheme: 'http', host: 'proxy1.com', port: 8080 },
                    bypassList: []
                },
                {
                    name: 'Proxy2',
                    profileType: 'FixedProfile',
                    color: 'red',
                    fallbackProxy: { scheme: 'http', host: 'proxy2.com', port: 8080 },
                    bypassList: []
                },
                {
                    name: 'Auto',
                    profileType: 'SwitchProfile',
                    color: 'purple',
                    defaultProfileName: 'Direct',
                    rules: [
                        {
                            condition: { conditionType: 'HostWildcardCondition', pattern: '*.example.com' },
                            profileName: 'Proxy1'
                        }
                    ]
                }
            ];
            const compiler = new PacCompiler(profiles);
            const result = compiler.compilePacScript('Auto');
            // Should include Auto, Direct, and Proxy1
            expect(result).toContain('"+Auto"');
            expect(result).toContain('"+Direct"');
            expect(result).toContain('"+Proxy1"');
            // Should NOT include unreferenced Proxy2
            expect(result).not.toContain('"+Proxy2"');
        });
    });
});
//# sourceMappingURL=pac-compiler.spec.js.map