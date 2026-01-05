/**
 * Service Worker for SwitchyMalaccamax
 * Handles proxy settings and background tasks
 */
console.log('[SwitchyMalaccamax] Service worker initialized');
/**
 * Initialize icon color based on active profile
 */
async function initializeIconColor() {
    try {
        const syncResult = await chrome.storage.sync.get(['activeProfileId']);
        const localResult = await chrome.storage.local.get(['profiles']);
        const profiles = localResult.profiles || [];
        const activeProfile = profiles.find((p) => p.id === syncResult.activeProfileId);
        if (activeProfile?.color) {
            updateIconColor(activeProfile.color);
            console.log('[SwitchyMalaccamax] Initialized icon with profile color:', activeProfile.color);
        }
        else {
            updateIconColor('blue'); // Default color
            console.log('[SwitchyMalaccamax] Initialized icon with default color: blue');
        }
    }
    catch (error) {
        console.error('[SwitchyMalaccamax] Failed to initialize icon color:', error);
        updateIconColor('blue'); // Fallback to default
    }
}
/**
 * Generate colored icon and update extension icon
 */
function updateIconColor(color) {
    const colors = {
        gray: '#9ca3af',
        blue: '#3b82f6',
        green: '#22c55e',
        red: '#ef4444',
        yellow: '#eab308',
        purple: '#a855f7',
    };
    const hexColor = colors[color] || colors.blue;
    // Generate icons for different sizes
    const sizes = [16, 48, 128];
    const imageData = {};
    sizes.forEach(size => {
        const canvas = new OffscreenCanvas(size, size);
        const ctx = canvas.getContext('2d');
        if (ctx) {
            // Clear canvas
            ctx.clearRect(0, 0, size, size);
            // Draw circle
            const centerX = size / 2;
            const centerY = size / 2;
            const radius = size * 0.35;
            // Outer circle (border)
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
            ctx.fillStyle = hexColor;
            ctx.fill();
            // Inner circle (white)
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius * 0.5, 0, 2 * Math.PI);
            ctx.fillStyle = '#ffffff';
            ctx.fill();
            // Draw arrow-like symbol
            ctx.strokeStyle = hexColor;
            ctx.lineWidth = size * 0.08;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            const arrowSize = radius * 0.3;
            ctx.beginPath();
            ctx.moveTo(centerX - arrowSize, centerY - arrowSize * 0.5);
            ctx.lineTo(centerX, centerY + arrowSize * 0.5);
            ctx.lineTo(centerX + arrowSize, centerY - arrowSize * 0.5);
            ctx.stroke();
            // Get image data
            imageData[size] = ctx.getImageData(0, 0, size, size);
        }
    });
    // Update icon
    chrome.action.setIcon({ imageData });
    console.log('[SwitchyMalaccamax] Icon updated with color:', color, hexColor);
}
/**
 * Apply startup profile on extension initialization
 */
async function applyStartupProfile() {
    try {
        const syncResult = await chrome.storage.sync.get(['settings', 'activeProfileId']);
        const localResult = await chrome.storage.local.get(['profiles']);
        const profiles = localResult.profiles || [];
        const settings = syncResult.settings || {};
        const startupProfileId = settings.startupProfile;
        console.log('[SwitchyMalaccamax] Startup profile ID:', startupProfileId);
        console.log('[SwitchyMalaccamax] Current active profile ID:', syncResult.activeProfileId);
        // If there's a startup profile set and it's different from current, apply it
        if (startupProfileId && startupProfileId !== syncResult.activeProfileId) {
            const startupProfile = profiles.find((p) => p.id === startupProfileId);
            if (startupProfile) {
                console.log('[SwitchyMalaccamax] Applying startup profile:', startupProfile.name);
                // Update active profile
                await chrome.storage.sync.set({ activeProfileId: startupProfileId });
                // Build and apply proxy config
                let config;
                if (startupProfile.profileType === 'DirectProfile') {
                    config = { mode: 'direct' };
                }
                else if (startupProfile.profileType === 'SystemProfile') {
                    config = { mode: 'system' };
                }
                else if (startupProfile.profileType === 'FixedProfile') {
                    const bypassList = [];
                    if (startupProfile.bypassList && Array.isArray(startupProfile.bypassList)) {
                        startupProfile.bypassList.forEach((condition) => {
                            if (condition.conditionType === 'BypassCondition' && condition.pattern) {
                                bypassList.push(condition.pattern);
                            }
                        });
                    }
                    config = {
                        mode: 'fixed_servers',
                        rules: {
                            singleProxy: {
                                scheme: startupProfile.proxyType?.toLowerCase() || 'http',
                                host: startupProfile.host || 'localhost',
                                port: startupProfile.port || 8080,
                            },
                            bypassList: bypassList.length > 0 ? bypassList : undefined,
                        },
                    };
                }
                else {
                    config = { mode: 'direct' };
                }
                await handleSetProxy(config);
                // Update icon color
                if (startupProfile.color) {
                    updateIconColor(startupProfile.color);
                }
            }
        }
        else {
            console.log('[SwitchyMalaccamax] No startup profile change needed');
        }
    }
    catch (error) {
        console.error('[SwitchyMalaccamax] Failed to apply startup profile:', error);
    }
}
// Check conflicts immediately on startup
checkProxyConflicts();
// Initialize icon color based on active profile
initializeIconColor();
// Apply startup profile
applyStartupProfile();
// Listen for extension installation
chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install') {
        console.log('[SwitchyMalaccamax] Extension installed');
        // Initialize default settings
        chrome.storage.sync.set({
            profiles: [],
            activeProfile: 'direct',
        });
    }
    // Check for conflicts on install/update
    checkProxyConflicts();
});
// Listen for messages from popup/options
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.action === 'setProxy') {
        (async () => {
            await handleSetProxy(message.config);
            if (message.profileColor) {
                updateIconColor(message.profileColor);
            }
            sendResponse({ success: true });
        })();
        return true; // Keep channel open for async response
    }
    else if (message.action === 'checkConflicts') {
        checkProxyConflicts().then(() => sendResponse({ success: true }));
        return true; // Keep channel open for async response
    }
    return false;
});
// Monitor proxy settings changes (with delay to allow changes to propagate)
chrome.proxy.settings.onChange.addListener((details) => {
    console.log('[SwitchyMalaccamax] ⚠️ PROXY SETTINGS CHANGED ⚠️');
    console.log('[SwitchyMalaccamax] Change details:', JSON.stringify(details, null, 2));
    console.log('[SwitchyMalaccamax] Level of control from onChange:', details.levelOfControl);
    // Check levelOfControl directly from the onChange event
    if (details.levelOfControl === 'controlled_by_other_extensions') {
        console.warn('[SwitchyMalaccamax] Detected control by another extension via onChange!');
        chrome.action.setBadgeText({ text: '!' });
        chrome.action.setBadgeBackgroundColor({ color: '#DC2626' });
        chrome.action.setTitle({
            title: 'SwitchyMalaccamax - Conflict: Another extension has higher priority'
        });
    }
    else if (details.levelOfControl === 'not_controllable') {
        console.warn('[SwitchyMalaccamax] Detected not_controllable via onChange!');
        chrome.action.setBadgeText({ text: '?' });
        chrome.action.setBadgeBackgroundColor({ color: '#F59E0B' });
        chrome.action.setTitle({
            title: 'SwitchyMalaccamax - Warning: Proxy cannot be controlled'
        });
    }
    else if (details.levelOfControl === 'controlled_by_this_extension') {
        console.log('[SwitchyMalaccamax] Confirmed control via onChange');
        chrome.action.setBadgeText({ text: '' });
        chrome.action.setBadgeBackgroundColor({ color: [0, 0, 0, 0] });
        chrome.action.setTitle({ title: 'SwitchyMalaccamax - Proxy Switcher' });
    }
    // Also check via get() as backup
    setTimeout(() => checkProxyConflicts(), 100);
    setTimeout(() => checkProxyConflicts(), 500);
});
// Periodic conflict check (every 30 seconds)
setInterval(() => {
    checkProxyConflicts();
}, 30000);
/**
 * Check if another extension is controlling the proxy
 */
async function checkProxyConflicts() {
    try {
        const proxySettings = await chrome.proxy.settings.get({});
        const levelOfControl = proxySettings.levelOfControl;
        console.log('[SwitchyMalaccamax] === Conflict Check ===');
        console.log('[SwitchyMalaccamax] Level of control:', levelOfControl);
        console.log('[SwitchyMalaccamax] Current proxy config:', JSON.stringify(proxySettings.value, null, 2));
        if (levelOfControl === 'controlled_by_other_extensions') {
            // Another extension has higher priority - show red badge
            await chrome.action.setBadgeText({ text: '!' });
            await chrome.action.setBadgeBackgroundColor({ color: '#DC2626' }); // red-600
            await chrome.action.setTitle({
                title: 'SwitchyMalaccamax - Conflict: Another extension has higher priority'
            });
            console.warn('[SwitchyMalaccamax] Proxy controlled by another extension');
        }
        else if (levelOfControl === 'controlled_by_this_extension') {
            // This extension has control - clear badge completely
            await chrome.action.setBadgeText({ text: '' });
            await chrome.action.setBadgeBackgroundColor({ color: [0, 0, 0, 0] }); // Transparent
            await chrome.action.setTitle({ title: 'SwitchyMalaccamax - Proxy Switcher' });
            console.log('[SwitchyMalaccamax] Proxy controlled by this extension');
        }
        else if (levelOfControl === 'controllable_by_this_extension') {
            // Can take control but hasn't - clear badge completely
            await chrome.action.setBadgeText({ text: '' });
            await chrome.action.setBadgeBackgroundColor({ color: [0, 0, 0, 0] }); // Transparent
            await chrome.action.setTitle({ title: 'SwitchyMalaccamax - Proxy Switcher' });
            console.log('[SwitchyMalaccamax] Proxy controllable by this extension');
        }
        else {
            // Not controllable (policy/system) - show amber warning
            await chrome.action.setBadgeText({ text: '?' });
            await chrome.action.setBadgeBackgroundColor({ color: '#F59E0B' }); // amber-500
            await chrome.action.setTitle({
                title: 'SwitchyMalaccamax - Warning: Proxy cannot be controlled'
            });
            console.warn('[SwitchyMalaccamax] Proxy not controllable');
        }
    }
    catch (error) {
        console.error('[SwitchyMalaccamax] Failed to check proxy conflicts:', error);
    }
}
/**
 * Apply proxy configuration
 */
async function handleSetProxy(config) {
    try {
        await chrome.proxy.settings.set({
            value: config,
            scope: 'regular',
        });
        console.log('[SwitchyMalaccamax] Proxy set successfully');
        // Check for conflicts immediately and again after a delay
        await checkProxyConflicts();
        setTimeout(() => checkProxyConflicts(), 500);
        setTimeout(() => checkProxyConflicts(), 1500);
    }
    catch (error) {
        console.error('[SwitchyMalaccamax] Failed to set proxy:', error);
        // Check conflicts even on error to show current state
        await checkProxyConflicts();
    }
}
export {};
//# sourceMappingURL=service-worker.js.map