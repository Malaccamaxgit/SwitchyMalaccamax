import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import { isFixedProfile, isSwitchProfile, isWildcardCondition } from '@/core/schema';
describe('Schema - ZeroOmega Export Compatibility', () => {
    let exportData;
    beforeAll(() => {
        // Load the actual ZeroOmega export file
        const exportPath = join(__dirname, '..', '..', 'tests', 'export_compatibility', 'ZeroOmegaExport_Company_Example.bak');
        const raw = readFileSync(exportPath, 'utf-8');
        exportData = JSON.parse(raw);
    });
    describe('Export Structure Validation', () => {
        it('should have schemaVersion = 2', () => {
            expect(exportData.schemaVersion).toBe(2);
        });
        it('should have profile keys starting with +', () => {
            const profileKeys = Object.keys(exportData).filter((k) => k.startsWith('+'));
            expect(profileKeys.length).toBeGreaterThan(0);
            expect(profileKeys).toContain('+Company');
            expect(profileKeys).toContain('+auto switch');
        });
        it('should have setting keys starting with -', () => {
            const settingKeys = Object.keys(exportData).filter((k) => k.startsWith('-'));
            expect(settingKeys.length).toBeGreaterThan(0);
            expect(settingKeys).toContain('-startupProfileName');
            expect(settingKeys).toContain('-confirmDeletion');
        });
        it('should parse settings correctly', () => {
            expect(exportData['-startupProfileName']).toBe('auto switch');
            expect(exportData['-confirmDeletion']).toBe(true);
            expect(exportData['-addConditionsToBottom']).toBe(true);
            expect(exportData['-downloadInterval']).toBe(1440);
        });
    });
    describe('Company Profile (FixedProfile)', () => {
        let companyProfile;
        beforeAll(() => {
            companyProfile = exportData['+Company'];
        });
        it('should exist and be a FixedProfile', () => {
            expect(companyProfile).toBeDefined();
            expect(companyProfile.profileType).toBe('FixedProfile');
            expect(isFixedProfile(companyProfile)).toBe(true);
        });
        it('should have correct metadata', () => {
            expect(companyProfile.name).toBe('Company');
            expect(companyProfile.color).toBe('#99ccee');
            expect(companyProfile.revision).toBe('19b2cb2c628');
        });
        it('should have fallbackProxy configuration', () => {
            const fixedProfile = companyProfile;
            expect(fixedProfile.fallbackProxy).toBeDefined();
            expect(fixedProfile.fallbackProxy.scheme).toBe('http');
            expect(fixedProfile.fallbackProxy.host).toBe('192.168.50.30');
            expect(fixedProfile.fallbackProxy.port).toBe(8213);
        });
        it('should have bypassList with 5 conditions', () => {
            const fixedProfile = companyProfile;
            expect(fixedProfile.bypassList).toBeDefined();
            expect(fixedProfile.bypassList).toHaveLength(5);
        });
        it('should have correct bypass conditions', () => {
            const fixedProfile = companyProfile;
            const bypassPatterns = fixedProfile.bypassList.map((c) => c.pattern);
            expect(bypassPatterns).toContain('192.168.2.0/24');
            expect(bypassPatterns).toContain('192.168.50.0/24');
            expect(bypassPatterns).toContain('127.0.0.1');
            expect(bypassPatterns).toContain('::1');
            expect(bypassPatterns).toContain('localhost');
        });
        it('all bypass conditions should be BypassCondition type', () => {
            const fixedProfile = companyProfile;
            fixedProfile.bypassList.forEach((condition) => {
                expect(condition.conditionType).toBe('BypassCondition');
            });
        });
    });
    describe('Auto Switch Profile (SwitchProfile)', () => {
        let autoSwitchProfile;
        beforeAll(() => {
            autoSwitchProfile = exportData['+auto switch'];
        });
        it('should exist and be a SwitchProfile', () => {
            expect(autoSwitchProfile).toBeDefined();
            expect(autoSwitchProfile.profileType).toBe('SwitchProfile');
            expect(isSwitchProfile(autoSwitchProfile)).toBe(true);
        });
        it('should have correct metadata', () => {
            expect(autoSwitchProfile.name).toBe('auto switch');
            expect(autoSwitchProfile.color).toBe('#99dd99');
            expect(autoSwitchProfile.revision).toBe('19b2d76f103');
        });
        it('should have defaultProfileName = direct', () => {
            const switchProfile = autoSwitchProfile;
            expect(switchProfile.defaultProfileName).toBe('direct');
        });
        it('should have 10 rules', () => {
            const switchProfile = autoSwitchProfile;
            expect(switchProfile.rules).toBeDefined();
            expect(switchProfile.rules).toHaveLength(10);
        });
        it('all rules should have condition and profileName', () => {
            const switchProfile = autoSwitchProfile;
            switchProfile.rules.forEach((rule) => {
                expect(rule.condition).toBeDefined();
                expect(rule.condition.conditionType).toBeDefined();
                expect(rule.profileName).toBeDefined();
            });
        });
        it('should have HostWildcardCondition rules', () => {
            const switchProfile = autoSwitchProfile;
            switchProfile.rules.forEach((rule) => {
                expect(rule.condition.conditionType).toBe('HostWildcardCondition');
                expect(isWildcardCondition(rule.condition)).toBe(true);
            });
        });
        it('should map specific domains to Company profile', () => {
            const switchProfile = autoSwitchProfile;
            const companyRules = switchProfile.rules.filter((r) => r.profileName === 'Company');
            expect(companyRules.length).toBeGreaterThan(0);
            const patterns = companyRules.map((r) => r.condition.pattern);
            expect(patterns).toContain('confluence.Company.com');
            expect(patterns).toContain('jira2.Company.com');
            expect(patterns).toContain('ai.Company.com');
            expect(patterns).toContain('*.Companyinternal.com');
            expect(patterns).toContain('*.Company.build');
            expect(patterns).toContain('*.InComp.io');
            expect(patterns).toContain('*.mlde.Company.com');
            expect(patterns).toContain('*.gowday.com');
        });
        it('should map Google domains to direct profile', () => {
            const switchProfile = autoSwitchProfile;
            const directRules = switchProfile.rules.filter((r) => r.profileName === 'direct');
            const patterns = directRules.map((r) => r.condition.pattern);
            expect(patterns).toContain('*.googletagmanager.com');
            expect(patterns).toContain('*.gstatic.com');
        });
    });
    describe('Type Guards', () => {
        it('isFixedProfile should correctly identify FixedProfile', () => {
            const company = exportData['+Company'];
            expect(isFixedProfile(company)).toBe(true);
        });
        it('isSwitchProfile should correctly identify SwitchProfile', () => {
            const autoSwitch = exportData['+auto switch'];
            expect(isSwitchProfile(autoSwitch)).toBe(true);
        });
        it('type guards should be mutually exclusive', () => {
            const company = exportData['+Company'];
            expect(isFixedProfile(company)).toBe(true);
            expect(isSwitchProfile(company)).toBe(false);
            const autoSwitch = exportData['+auto switch'];
            expect(isSwitchProfile(autoSwitch)).toBe(true);
            expect(isFixedProfile(autoSwitch)).toBe(false);
        });
    });
    describe('Data Integrity', () => {
        it('should preserve all original keys', () => {
            const keys = Object.keys(exportData);
            expect(keys).toContain('+Company');
            expect(keys).toContain('+auto switch');
            expect(keys).toContain('-startupProfileName');
            expect(keys).toContain('-customCss');
            expect(keys).toContain('schemaVersion');
        });
        it('should preserve custom CSS exactly', () => {
            const customCss = exportData['-customCss'];
            expect(customCss).toBeDefined();
            expect(typeof customCss).toBe('string');
            expect(customCss.length).toBeGreaterThan(100);
            expect(customCss).toContain(':root');
            expect(customCss).toContain('--defaultBackground');
        });
        it('should handle boolean settings correctly', () => {
            expect(exportData['-confirmDeletion']).toBe(true);
            expect(exportData['-addConditionsToBottom']).toBe(true);
            expect(exportData['-enableQuickSwitch']).toBe(false);
            expect(exportData['-monitorWebRequests']).toBe(false);
        });
        it('should handle array settings correctly', () => {
            expect(Array.isArray(exportData['-quickSwitchProfiles'])).toBe(true);
            expect(exportData['-quickSwitchProfiles']).toHaveLength(0);
        });
    });
    describe('Export Round-trip', () => {
        it('should serialize back to identical JSON structure', () => {
            const serialized = JSON.stringify(exportData);
            const deserialized = JSON.parse(serialized);
            expect(deserialized.schemaVersion).toBe(exportData.schemaVersion);
            expect(deserialized['+Company']).toEqual(exportData['+Company']);
            expect(deserialized['+auto switch']).toEqual(exportData['+auto switch']);
        });
        it('should preserve nested structures', () => {
            const serialized = JSON.stringify(exportData);
            const deserialized = JSON.parse(serialized);
            const originalCompany = exportData['+Company'];
            const deserializedCompany = deserialized['+Company'];
            expect(deserializedCompany.bypassList).toHaveLength(originalCompany.bypassList.length);
            expect(deserializedCompany.fallbackProxy).toEqual(originalCompany.fallbackProxy);
        });
    });
    describe('Schema Version 2 Compliance', () => {
        it('should be schema version 2', () => {
            expect(exportData.schemaVersion).toBe(2);
        });
        it('should support all required profile types', () => {
            // At minimum, we should handle FixedProfile and SwitchProfile
            const profileTypes = Object.keys(exportData)
                .filter((k) => k.startsWith('+'))
                .map((k) => exportData[k])
                .map((p) => p.profileType);
            expect(profileTypes).toContain('FixedProfile');
            expect(profileTypes).toContain('SwitchProfile');
        });
        it('should support all required condition types', () => {
            const allConditions = [];
            // Collect from FixedProfile bypassList
            const company = exportData['+Company'];
            company.bypassList?.forEach((c) => allConditions.push(c.conditionType));
            // Collect from SwitchProfile rules
            const autoSwitch = exportData['+auto switch'];
            autoSwitch.rules.forEach((r) => allConditions.push(r.condition.conditionType));
            expect(allConditions).toContain('BypassCondition');
            expect(allConditions).toContain('HostWildcardCondition');
        });
    });
});
//# sourceMappingURL=schema.spec.js.map