import type { Profile } from '@/core/schema';
import { encryptProfile } from '@/utils/crypto';
import { decryptProfilesFromStorage } from '@/utils/profile-storage';
import { Logger } from '@/utils/Logger';

const log = Logger.scope('OptionsProfiles');

/**
 * Load profiles from chrome.storage.local with decrypt + name migrations, persisting when needed.
 */
export async function loadDecryptMigrateProfiles(defaultProfiles: Profile[]): Promise<Profile[]> {
  const localResult = await chrome.storage.local.get(['profiles']);
  let profiles: Profile[] = [...defaultProfiles];

  if (localResult.profiles && Array.isArray(localResult.profiles) && localResult.profiles.length > 0) {
    profiles = await decryptProfilesFromStorage(localResult.profiles);
    log.info(`Loaded ${profiles.length} profiles from storage`);

    let needsSave = false;
    for (const p of profiles) {
      if (p.name === 'auto switch') {
        p.name = 'Auto Switch';
        needsSave = true;
        log.info('Migrated profile name: "auto switch" → "Auto Switch"');
      }
      if (p.name === 'Builtin') {
        p.name = 'Direct';
        needsSave = true;
        log.info('Migrated profile name: "Builtin" → "Direct"');
      }
    }
    for (const p of profiles) {
      if (p.profileType === 'SwitchProfile' && p.defaultProfileName === 'Builtin') {
        p.defaultProfileName = 'Direct';
        needsSave = true;
        log.info('Migrated default profile name in Auto Switch');
      }
    }

    if (needsSave) {
      const encryptedProfiles = await Promise.all(
        profiles.map((profile) => encryptProfile(profile as unknown as Record<string, unknown>))
      );
      await chrome.storage.local.set({ profiles: encryptedProfiles });
      log.info('Profile migrations saved');
    }
  } else {
    log.info('No profiles in storage, using defaults');
    const encryptedProfiles = await Promise.all(
      profiles.map((profile) => encryptProfile(profile as unknown as Record<string, unknown>))
    );
    await chrome.storage.local.set({ profiles: encryptedProfiles });
  }

  return profiles;
}
