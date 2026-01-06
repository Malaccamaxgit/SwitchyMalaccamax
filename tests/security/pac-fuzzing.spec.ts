/**
 * PAC Generator Fuzzing Test Suite
 * Security-focused tests for injection and edge cases
 */

import { describe, it, expect } from 'vitest';
import { PacCompiler } from '@/core/pac/pac-generator';
import type { Profile, FixedProfile, SwitchProfile } from '@/core/schema';

describe('PacGenerator - Security Fuzzing', () => {
  describe('Profile Name Injection Tests', () => {
    it('should sanitize malicious JavaScript in profile name', () => {
      const maliciousProfile: FixedProfile = {
        name: '"); alert("XSS"); //',
        profileType: 'FixedProfile',
        color: 'blue',
        fallbackProxy: {
          scheme: 'http',
          host: 'proxy.example.com',
          port: 8080
        },
        bypassList: []
      };

      const compiler = new PacCompiler([maliciousProfile]);
      const pacScript = compiler.compilePacScript('"); alert("XSS"); //');

      // Should not contain unescaped quotes or alert
      expect(pacScript).not.toContain('alert(');
      expect(pacScript).not.toContain('"); ');
      // Should be sanitized - non-alphanumeric replaced with underscores
      expect(pacScript).toContain('___');
    });

    it('should handle Unicode and emoji in profile names', () => {
      const unicodeProfile: FixedProfile = {
        name: 'Proxy 🚀 测试',
        profileType: 'FixedProfile',
        color: 'green',
        fallbackProxy: {
          scheme: 'http',
          host: 'proxy.test',
          port: 3128
        },
        bypassList: []
      };

      const compiler = new PacCompiler([unicodeProfile]);
      const pacScript = compiler.compilePacScript('Proxy 🚀 测试');

      // Should compile without errors and sanitize non-ASCII
      expect(pacScript).toBeDefined();
      expect(pacScript.length).toBeGreaterThan(100);
    });

    it('should prevent script tag injection in profile name', () => {
      const scriptProfile: FixedProfile = {
        name: '<script>alert(1)</script>',
        profileType: 'FixedProfile',
        color: 'red',
        fallbackProxy: {
          scheme: 'socks5',
          host: 'localhost',
          port: 1080
        },
        bypassList: []
      };

      const compiler = new PacCompiler([scriptProfile]);
      const pacScript = compiler.compilePacScript('<script>alert(1)</script>');

      // Should not contain raw HTML tags
      expect(pacScript).not.toContain('<script>');
      expect(pacScript).not.toContain('</script>');
    });

    it('should handle newlines and control characters in profile name', () => {
      const controlProfile: FixedProfile = {
        name: 'Test\nProxy\r\nWith\tControls',
        profileType: 'FixedProfile',
        color: 'yellow',
        fallbackProxy: {
          scheme: 'https',
          host: 'secure.proxy',
          port: 443
        },
        bypassList: []
      };

      const compiler = new PacCompiler([controlProfile]);
      const pacScript = compiler.compilePacScript('Test\nProxy\r\nWith\tControls');

      // Profile name should be sanitized (control chars → underscores)
      expect(pacScript).toContain('Test_Proxy');
      expect(pacScript).toContain('With_Controls');
      // PAC script itself has newlines in function structure (valid JavaScript)
      // But the profile name should not have control chars
    });
  });

  describe('Bypass Pattern Injection Tests', () => {
    it('should sanitize malicious regex in bypass patterns', () => {
      const bypassProfile: FixedProfile = {
        name: 'Bypass Test',
        profileType: 'FixedProfile',
        color: 'purple',
        fallbackProxy: {
          scheme: 'http',
          host: 'proxy.test',
          port: 8080
        },
        bypassList: [
          {
            conditionType: 'BypassCondition',
            pattern: '.*(?:(?:(?:(?:(?:' // ReDoS pattern
          }
        ]
      };

      const compiler = new PacCompiler([bypassProfile]);
      
      // Should not throw error and should sanitize
      const pacScript = compiler.compilePacScript('Bypass Test');
      expect(pacScript).toBeDefined();
    });

    it('should handle extremely long bypass patterns', () => {
      const longPattern = 'a'.repeat(10000);
      const longProfile: FixedProfile = {
        name: 'Long Pattern',
        profileType: 'FixedProfile',
        color: 'gray',
        fallbackProxy: {
          scheme: 'http',
          host: 'proxy.test',
          port: 8080
        },
        bypassList: [
          {
            conditionType: 'BypassCondition',
            pattern: longPattern
          }
        ]
      };

      const compiler = new PacCompiler([longProfile]);
      const pacScript = compiler.compilePacScript('Long Pattern');

      // Should compile but may truncate or limit pattern
      expect(pacScript).toBeDefined();
      expect(pacScript.length).toBeLessThan(1000000); // Reasonable size limit
    });
  });

  describe('Host/URL Pattern Injection Tests', () => {
    it('should sanitize JavaScript in URL patterns', () => {
      const urlProfile: SwitchProfile = {
        name: 'URL Test',
        profileType: 'SwitchProfile',
        color: 'blue',
        defaultProfileName: 'Direct',
        rules: [
          {
            condition: {
              conditionType: 'HostWildcardCondition',
              pattern: '*.example.com"); alert("pwned"); //'
            },
            profileName: 'Test'
          }
        ]
      };

      const directProfile: Profile = {
        name: 'Direct',
        profileType: 'DirectProfile',
        color: 'gray'
      };

      const testProfile: FixedProfile = {
        name: 'Test',
        profileType: 'FixedProfile',
        color: 'green',
        fallbackProxy: {
          scheme: 'http',
          host: 'proxy.test',
          port: 8080
        },
        bypassList: []
      };

      const compiler = new PacCompiler([urlProfile, directProfile, testProfile]);
      const pacScript = compiler.compilePacScript('URL Test');

      // Should not contain unescaped injection attempt
      expect(pacScript).not.toContain('alert("pwned")');
    });
  });

  describe('Nested Profile Injection', () => {
    it('should prevent circular reference exploitation', () => {
      const profile1: SwitchProfile = {
        name: 'Switch 1',
        profileType: 'SwitchProfile',
        color: 'blue',
        defaultProfileName: 'Switch 2',
        rules: []
      };

      const profile2: SwitchProfile = {
        name: 'Switch 2',
        profileType: 'SwitchProfile',
        color: 'green',
        defaultProfileName: 'Switch 1', // Circular reference
        rules: []
      };

      const compiler = new PacCompiler([profile1, profile2]);
      
      // Should handle gracefully without infinite loop
      const pacScript = compiler.compilePacScript('Switch 1');
      expect(pacScript).toBeDefined();
    });
  });

  describe('PAC Function Execution Safety', () => {
    it('should generate valid JavaScript syntax', () => {
      const profile: FixedProfile = {
        name: 'Syntax Test',
        profileType: 'FixedProfile',
        color: 'blue',
        fallbackProxy: {
          scheme: 'http',
          host: 'proxy.test',
          port: 8080
        },
        bypassList: []
      };

      const compiler = new PacCompiler([profile]);
      const pacScript = compiler.compilePacScript('Syntax Test');

      // Try to parse as JavaScript (will throw if invalid)
      expect(() => {
        new Function(pacScript);
      }).not.toThrow();
    });
  });
});


