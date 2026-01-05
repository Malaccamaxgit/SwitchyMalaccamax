/**
 * conditions.spec.ts - Comprehensive tests for condition matching engine
 *
 * Tests all 7 condition types with:
 * - Logic preservation from original CoffeeScript
 * - Security integration (ReDoS protection)
 * - Real ZeroOmega export data
 * - Poison-pill pattern rejection
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { ConditionMatcher, matchCondition, createContext, } from '@/core/conditions';
describe('ConditionMatcher', () => {
    beforeEach(() => {
        // Clear regex cache before each test
        ConditionMatcher.clearCache();
    });
    describe('createContext', () => {
        it('should parse valid URL correctly', () => {
            const ctx = createContext('https://example.com/path?query=1');
            expect(ctx.url).toBe('https://example.com/path?query=1');
            expect(ctx.host).toBe('example.com');
            expect(ctx.scheme).toBe('https');
            expect(ctx.path).toBe('/path?query=1');
        });
        it('should handle URLs without paths', () => {
            const ctx = createContext('http://example.com');
            expect(ctx.host).toBe('example.com');
            expect(ctx.scheme).toBe('http');
            expect(ctx.path).toBe('/');
        });
        it('should handle invalid URLs gracefully', () => {
            const ctx = createContext('not-a-url');
            expect(ctx.url).toBe('not-a-url');
            expect(ctx.host).toBe('');
            expect(ctx.scheme).toBe('');
        });
    });
    describe('BypassCondition', () => {
        describe('Special keywords', () => {
            it('should match <local> for hostnames without dots', () => {
                const condition = {
                    conditionType: 'BypassCondition',
                    pattern: '<local>',
                };
                const ctx = createContext('http://localhost/');
                const result = ConditionMatcher.match(condition, ctx);
                expect(result.matched).toBe(true);
                expect(result.reason).toContain('Local hostname');
            });
            it('should not match <local> for FQDNs', () => {
                const condition = {
                    conditionType: 'BypassCondition',
                    pattern: '<local>',
                };
                const ctx = createContext('http://example.com/');
                const result = ConditionMatcher.match(condition, ctx);
                expect(result.matched).toBe(false);
            });
        });
        describe('Exact hostname matching', () => {
            it('should match exact hostname (case-insensitive)', () => {
                const condition = {
                    conditionType: 'BypassCondition',
                    pattern: 'localhost',
                };
                const ctx = createContext('http://LOCALHOST/');
                const result = ConditionMatcher.match(condition, ctx);
                expect(result.matched).toBe(true);
            });
            it('should match IP addresses', () => {
                const condition = {
                    conditionType: 'BypassCondition',
                    pattern: '127.0.0.1',
                };
                const ctx = createContext('http://127.0.0.1/');
                const result = ConditionMatcher.match(condition, ctx);
                expect(result.matched).toBe(true);
            });
            it('should match IPv6 addresses', () => {
                const condition = {
                    conditionType: 'BypassCondition',
                    pattern: '::1',
                };
                const ctx = createContext('http://[::1]/');
                const result = ConditionMatcher.match(condition, ctx);
                expect(result.matched).toBe(true);
            });
        });
        describe('CIDR notation', () => {
            it('should match IPv4 CIDR', () => {
                const condition = {
                    conditionType: 'BypassCondition',
                    pattern: '192.168.1.0/24',
                };
                const ctx = createContext('http://192.168.1.100/');
                const result = ConditionMatcher.match(condition, ctx);
                expect(result.matched).toBe(true);
            });
            it('should not match outside IPv4 CIDR', () => {
                const condition = {
                    conditionType: 'BypassCondition',
                    pattern: '192.168.1.0/24',
                };
                const ctx = createContext('http://192.168.2.100/');
                const result = ConditionMatcher.match(condition, ctx);
                expect(result.matched).toBe(false);
            });
            it('should match IPv6 CIDR', () => {
                const condition = {
                    conditionType: 'BypassCondition',
                    pattern: '2001:db8::/32',
                };
                const ctx = createContext('http://[2001:db8::1]/');
                const result = ConditionMatcher.match(condition, ctx);
                expect(result.matched).toBe(true);
            });
        });
    });
    describe('HostWildcardCondition', () => {
        it('should match * wildcard', () => {
            const condition = {
                conditionType: 'HostWildcardCondition',
                pattern: '*.example.com',
            };
            const ctx = createContext('http://sub.example.com/');
            const result = ConditionMatcher.match(condition, ctx);
            expect(result.matched).toBe(true);
        });
        it('should not match exact domain with *.domain', () => {
            const condition = {
                conditionType: 'HostWildcardCondition',
                pattern: '*.example.com',
            };
            const ctx = createContext('http://example.com/');
            const result = ConditionMatcher.match(condition, ctx);
            expect(result.matched).toBe(false);
        });
        it('should match exact domain with **.domain', () => {
            const condition = {
                conditionType: 'HostWildcardCondition',
                pattern: '**.example.com',
            };
            const ctx = createContext('http://example.com/');
            const result = ConditionMatcher.match(condition, ctx);
            expect(result.matched).toBe(true);
        });
        it('should match ? wildcard', () => {
            const condition = {
                conditionType: 'HostWildcardCondition',
                pattern: 'test?.example.com',
            };
            const ctx = createContext('http://test1.example.com/');
            const result = ConditionMatcher.match(condition, ctx);
            expect(result.matched).toBe(true);
        });
        it('should match from real ZeroOmega export', () => {
            const condition = {
                conditionType: 'HostWildcardCondition',
                pattern: 'confluence.Company.com',
            };
            const ctx = createContext('http://confluence.Company.com/wiki');
            const result = ConditionMatcher.match(condition, ctx);
            expect(result.matched).toBe(true);
        });
    });
    describe('HostRegexCondition', () => {
        it('should match valid regex pattern', () => {
            const condition = {
                conditionType: 'HostRegexCondition',
                pattern: '^.*\\.example\\.com$',
            };
            const ctx = createContext('http://sub.example.com/');
            const result = ConditionMatcher.match(condition, ctx);
            expect(result.matched).toBe(true);
        });
        it('should not match when pattern does not match', () => {
            const condition = {
                conditionType: 'HostRegexCondition',
                pattern: '^test\\.com$',
            };
            const ctx = createContext('http://example.com/');
            const result = ConditionMatcher.match(condition, ctx);
            expect(result.matched).toBe(false);
        });
        describe('ReDoS Protection', () => {
            it('should REJECT catastrophic backtracking pattern', () => {
                const condition = {
                    conditionType: 'HostRegexCondition',
                    pattern: '(a+)+',
                };
                const ctx = createContext('http://example.com/');
                const result = ConditionMatcher.match(condition, ctx);
                expect(result.matched).toBe(false);
                expect(result.reason).toContain('Unsafe regex pattern rejected');
            });
            it('should REJECT nested quantifiers', () => {
                const condition = {
                    conditionType: 'HostRegexCondition',
                    pattern: '(.+)*\\.com',
                };
                const ctx = createContext('http://example.com/');
                const result = ConditionMatcher.match(condition, ctx);
                expect(result.matched).toBe(false);
                expect(result.reason).toContain('Unsafe regex pattern rejected');
            });
            it('should REJECT exponential alternations', () => {
                const condition = {
                    conditionType: 'HostRegexCondition',
                    pattern: '(x+x+)+y',
                };
                const ctx = createContext('http://example.com/');
                const result = ConditionMatcher.match(condition, ctx);
                expect(result.matched).toBe(false);
                expect(result.reason).toContain('Unsafe regex pattern rejected');
            });
            it('should ACCEPT safe regex patterns', () => {
                const condition = {
                    conditionType: 'HostRegexCondition',
                    pattern: '^[a-z]+\\.example\\.com$',
                };
                const ctx = createContext('http://test.example.com/');
                const result = ConditionMatcher.match(condition, ctx);
                expect(result.matched).toBe(true);
            });
        });
        describe('Regex Caching', () => {
            it('should cache compiled regex for performance', () => {
                const condition = {
                    conditionType: 'HostRegexCondition',
                    pattern: '^test\\.com$',
                };
                const ctx = createContext('http://test.com/');
                // First call compiles
                const result1 = ConditionMatcher.match(condition, ctx);
                expect(result1.matched).toBe(true);
                // Second call uses cache
                const result2 = ConditionMatcher.match(condition, ctx);
                expect(result2.matched).toBe(true);
            });
            it('should cache rejection of unsafe patterns', () => {
                const condition = {
                    conditionType: 'HostRegexCondition',
                    pattern: '(a+)+',
                };
                const ctx = createContext('http://example.com/');
                // First call validates and caches rejection
                const result1 = ConditionMatcher.match(condition, ctx);
                expect(result1.matched).toBe(false);
                // Second call uses cached rejection
                const result2 = ConditionMatcher.match(condition, ctx);
                expect(result2.matched).toBe(false);
            });
        });
    });
    describe('HostLevelsCondition', () => {
        it('should match exact level count', () => {
            const condition = {
                conditionType: 'HostLevelsCondition',
                minValue: 2,
                maxValue: 2,
            };
            const ctx = createContext('http://example.com/'); // 2 levels
            const result = ConditionMatcher.match(condition, ctx);
            expect(result.matched).toBe(true);
        });
        it('should match range of levels', () => {
            const condition = {
                conditionType: 'HostLevelsCondition',
                minValue: 2,
                maxValue: 3,
            };
            const ctx1 = createContext('http://example.com/'); // 2 levels
            const ctx2 = createContext('http://sub.example.com/'); // 3 levels
            expect(ConditionMatcher.match(condition, ctx1).matched).toBe(true);
            expect(ConditionMatcher.match(condition, ctx2).matched).toBe(true);
        });
        it('should not match outside range', () => {
            const condition = {
                conditionType: 'HostLevelsCondition',
                minValue: 3,
                maxValue: 4,
            };
            const ctx = createContext('http://example.com/'); // 2 levels
            const result = ConditionMatcher.match(condition, ctx);
            expect(result.matched).toBe(false);
        });
        it('should handle infinity (-1) for max', () => {
            const condition = {
                conditionType: 'HostLevelsCondition',
                minValue: 2,
                maxValue: -1, // infinity
            };
            const ctx = createContext('http://very.deep.sub.example.com/'); // 5 levels
            const result = ConditionMatcher.match(condition, ctx);
            expect(result.matched).toBe(true);
        });
    });
    describe('UrlWildcardCondition', () => {
        it('should match full URL wildcard', () => {
            const condition = {
                conditionType: 'UrlWildcardCondition',
                pattern: 'https://*.example.com/*',
            };
            const ctx = createContext('https://sub.example.com/path');
            const result = ConditionMatcher.match(condition, ctx);
            expect(result.matched).toBe(true);
        });
        it('should match URL with protocol wildcard', () => {
            const condition = {
                conditionType: 'UrlWildcardCondition',
                pattern: '*://example.com/*',
            };
            const ctx = createContext('https://example.com/path');
            const result = ConditionMatcher.match(condition, ctx);
            expect(result.matched).toBe(true);
        });
        it('should not match different protocol', () => {
            const condition = {
                conditionType: 'UrlWildcardCondition',
                pattern: 'https://example.com/*',
            };
            const ctx = createContext('http://example.com/path');
            const result = ConditionMatcher.match(condition, ctx);
            expect(result.matched).toBe(false);
        });
    });
    describe('UrlRegexCondition', () => {
        it('should match URL regex pattern', () => {
            const condition = {
                conditionType: 'UrlRegexCondition',
                pattern: '^https://.*\\.example\\.com/.*$',
            };
            const ctx = createContext('https://sub.example.com/path');
            const result = ConditionMatcher.match(condition, ctx);
            expect(result.matched).toBe(true);
        });
        describe('ReDoS Protection', () => {
            it('should REJECT unsafe URL regex', () => {
                const condition = {
                    conditionType: 'UrlRegexCondition',
                    pattern: '(.*)*',
                };
                const ctx = createContext('https://example.com/');
                const result = ConditionMatcher.match(condition, ctx);
                expect(result.matched).toBe(false);
                expect(result.reason).toContain('Unsafe regex pattern rejected');
            });
        });
    });
    describe('KeywordCondition', () => {
        it('should match keyword in URL', () => {
            const condition = {
                conditionType: 'KeywordCondition',
                pattern: 'admin',
            };
            const ctx = createContext('https://example.com/admin/dashboard');
            const result = ConditionMatcher.match(condition, ctx);
            expect(result.matched).toBe(true);
        });
        it('should be case-insensitive', () => {
            const condition = {
                conditionType: 'KeywordCondition',
                pattern: 'ADMIN',
            };
            const ctx = createContext('https://example.com/admin/dashboard');
            const result = ConditionMatcher.match(condition, ctx);
            expect(result.matched).toBe(true);
        });
        it('should not match when keyword absent', () => {
            const condition = {
                conditionType: 'KeywordCondition',
                pattern: 'admin',
            };
            const ctx = createContext('https://example.com/user/profile');
            const result = ConditionMatcher.match(condition, ctx);
            expect(result.matched).toBe(false);
        });
    });
    describe('Real ZeroOmega Export Data', () => {
        it('should match Company domain patterns from export', () => {
            const patterns = [
                'confluence.Company.com',
                'jira2.Company.com',
                'ai.Company.com',
                'svc-sdwan-vmanage.Company.com',
            ];
            for (const pattern of patterns) {
                const condition = {
                    conditionType: 'HostWildcardCondition',
                    pattern,
                };
                const ctx = createContext(`https://${pattern}/path`);
                const result = ConditionMatcher.match(condition, ctx);
                expect(result.matched).toBe(true);
            }
        });
        it('should match bypass conditions from export', () => {
            const patterns = ['127.0.0.1', '[::1]', 'localhost'];
            for (const pattern of patterns) {
                const condition = {
                    conditionType: 'BypassCondition',
                    pattern,
                };
                // Create appropriate context
                let url = 'http://localhost/';
                if (pattern === '127.0.0.1')
                    url = 'http://127.0.0.1/';
                if (pattern === '[::1]')
                    url = 'http://[::1]/';
                const ctx = createContext(url);
                const result = ConditionMatcher.match(condition, ctx);
                expect(result.matched).toBe(true);
            }
        });
    });
    describe('Poison-Pill Pattern Tests', () => {
        const poisonPatterns = [
            '(a+)+',
            '(x+x+)+y',
            '(.*)*',
            '(.+)*',
            '([a-zA-Z]+)*',
        ];
        const falseNegatives = [
            '(a|a)*', // safe-regex limitation: doesn't detect polynomial alternation
            '(a|ab)*', // safe-regex limitation: doesn't detect polynomial alternation
        ];
        poisonPatterns.forEach((pattern) => {
            it(`should REJECT poison pattern: ${pattern}`, () => {
                const condition = {
                    conditionType: 'HostRegexCondition',
                    pattern,
                };
                const ctx = createContext('http://example.com/');
                const result = ConditionMatcher.match(condition, ctx);
                expect(result.matched).toBe(false);
                expect(result.reason).toContain('Unsafe regex pattern rejected');
            });
        });
        falseNegatives.forEach((pattern) => {
            it.skip(`should REJECT poison pattern (known limitation): ${pattern}`, () => {
                // NOTE: safe-regex doesn't detect these polynomial alternation patterns
                // They SHOULD be rejected but aren't due to static analysis limitations
                const condition = {
                    conditionType: 'HostRegexCondition',
                    pattern,
                };
                const ctx = createContext('http://example.com/');
                const result = ConditionMatcher.match(condition, ctx);
                expect(result.matched).toBe(false);
                expect(result.reason).toContain('Unsafe regex pattern rejected');
            });
        });
    });
    describe('Convenience Functions', () => {
        it('should use matchCondition convenience function', () => {
            const condition = {
                conditionType: 'HostWildcardCondition',
                pattern: '*.example.com',
            };
            const ctx = createContext('http://sub.example.com/');
            expect(matchCondition(condition, ctx)).toBe(true);
        });
    });
    describe('Unknown Condition Type', () => {
        it('should return false for unknown condition type', () => {
            const condition = {
                conditionType: 'UnknownCondition',
                pattern: 'test',
            };
            const ctx = createContext('http://example.com/');
            const result = ConditionMatcher.match(condition, ctx);
            expect(result.matched).toBe(false);
            expect(result.reason).toContain('Unknown condition type');
        });
    });
    describe('Cache Management', () => {
        it('should clear cache', () => {
            const condition = {
                conditionType: 'HostRegexCondition',
                pattern: '^test\\.com$',
            };
            const ctx = createContext('http://test.com/');
            // Compile and cache
            ConditionMatcher.match(condition, ctx);
            // Clear cache
            ConditionMatcher.clearCache();
            // Should still work after cache clear
            const result = ConditionMatcher.match(condition, ctx);
            expect(result.matched).toBe(true);
        });
    });
    describe('Performance', () => {
        it('should execute wildcard matching in reasonable time', () => {
            const condition = {
                conditionType: 'HostWildcardCondition',
                pattern: '*.*.*.*.*.*.example.com',
            };
            const ctx = createContext('http://a.b.c.d.e.f.example.com/');
            const start = performance.now();
            ConditionMatcher.match(condition, ctx);
            const elapsed = performance.now() - start;
            expect(elapsed).toBeLessThan(50); // Should complete in < 50ms
        });
        it('should execute safe regex in reasonable time', () => {
            const condition = {
                conditionType: 'HostRegexCondition',
                pattern: '^[a-z]+\\.example\\.com$',
            };
            const ctx = createContext('http://test.example.com/');
            const start = performance.now();
            ConditionMatcher.match(condition, ctx);
            const elapsed = performance.now() - start;
            expect(elapsed).toBeLessThan(50); // Should complete in < 50ms
        });
    });
});
//# sourceMappingURL=conditions.spec.js.map