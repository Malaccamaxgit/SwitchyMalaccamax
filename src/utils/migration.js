/**
 * Storage migration utility to encrypt existing proxy credentials
 * Run once on extension update to secure existing data
 */
import { Logger } from '../utils/Logger';
import { encryptProfile, isEncrypted } from '../utils/crypto';
Logger.setComponentPrefix('Migration');
/**
 * Migrate all profiles in storage to use encrypted credentials
 */
export async function migrateToEncryptedStorage() {
    try {
        // Check if migration already completed
        const { migrationVersion } = await chrome.storage.local.get('migrationVersion');
        if (migrationVersion >= 1) {
            Logger.info('Storage already migrated to encryption');
            return;
        }
        Logger.info('Starting storage encryption migration...');
        // Get all profiles from storage
        const { profiles } = await chrome.storage.local.get('profiles');
        if (!profiles || !Array.isArray(profiles)) {
            Logger.info('No profiles to migrate');
            await chrome.storage.local.set({ migrationVersion: 1 });
            return;
        }
        let migratedCount = 0;
        let alreadyEncryptedCount = 0;
        // Encrypt each profile
        const encryptedProfiles = await Promise.all(profiles.map(async (profile) => {
            // Check if credentials already encrypted
            const usernameEncrypted = !profile.username || isEncrypted(profile.username);
            const passwordEncrypted = !profile.password || isEncrypted(profile.password);
            if (usernameEncrypted && passwordEncrypted) {
                alreadyEncryptedCount++;
                return profile;
            }
            // Encrypt credentials
            const encrypted = await encryptProfile(profile);
            migratedCount++;
            return encrypted;
        }));
        // Save encrypted profiles
        await chrome.storage.local.set({
            profiles: encryptedProfiles,
            migrationVersion: 1,
        });
        Logger.info('Storage migration complete', {
            total: profiles.length,
            migrated: migratedCount,
            alreadyEncrypted: alreadyEncryptedCount,
        });
    }
    catch (error) {
        Logger.error('Storage migration failed', error);
        throw error;
    }
}
/**
 * Check if credentials in a profile need encryption
 */
export function needsEncryption(profile) {
    const hasPlaintextUsername = profile.username && !isEncrypted(profile.username);
    const hasPlaintextPassword = profile.password && !isEncrypted(profile.password);
    return hasPlaintextUsername || hasPlaintextPassword;
}
//# sourceMappingURL=migration.js.map