/**
 * Sync setting `settings.startupProfile` value: keep `activeProfileId` and re-apply its proxy on load.
 * Must not collide with any real profile `id`.
 */
export const STARTUP_PROFILE_LAST_USED = '__last_used__';
