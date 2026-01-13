/**
 * Service Worker for SwitchyMalaccamax
 * Handles proxy settings and background tasks
 */
import { Logger } from '../utils/Logger';
import { migrateToEncryptedStorage } from '../utils/migration';

Logger.setComponentPrefix('Background');
Logger.info('Service worker initialized');

// ============================================================================
// MESSAGE TYPES (Security Enhancement)
// ============================================================================

interface BaseMessage {
  action: string;
}

interface SetProxyMessage extends BaseMessage {
  action: 'setProxy';
  config: chrome.proxy.ProxyConfig;
  profileColor?: string;
}

interface CheckConflictsMessage extends BaseMessage {
  action: 'checkConflicts';
}

type ExtensionMessage = SetProxyMessage | CheckConflictsMessage;

// Action whitelist for validation
const ALLOWED_ACTIONS = ['setProxy', 'checkConflicts'] as const;
type AllowedAction = typeof ALLOWED_ACTIONS[number];

function isAllowedAction(action: any): action is AllowedAction {
  return ALLOWED_ACTIONS.includes(action);
}

// Rate limiting map: senderId -> last message timestamp
const messageRateLimit = new Map<string, number>();
const RATE_LIMIT_MS = 100; // Max 10 messages per second per sender

// Run storage encryption migration on startup
migrateToEncryptedStorage().catch(error => {
  Logger.error('Failed to migrate storage to encryption', error);
});

// ============================================================================
// MESSAGE VALIDATION
// ============================================================================

/**
 * Validate proxy configuration structure
 */
function isValidProxyConfig(config: any): config is chrome.proxy.ProxyConfig {
  if (!config || typeof config !== 'object') return false;
  
  // Must have valid mode
  const validModes = ['direct', 'auto_detect', 'pac_script', 'fixed_servers', 'system'];
  if (!config.mode || !validModes.includes(config.mode)) return false;
  
  // pac_script mode requires pacScript
  if (config.mode === 'pac_script') {
    if (!config.pacScript || typeof config.pacScript !== 'object') return false;
    if (!config.pacScript.data && !config.pacScript.url) return false;
  }
  
  // fixed_servers mode requires rules
  if (config.mode === 'fixed_servers') {
    if (!config.rules || typeof config.rules !== 'object') return false;
  }
  
  return true;
}

/**
 * Validate color value (must be from allowed set)
 */
function isValidColor(color: any): boolean {
  const allowedColors = ['gray', 'blue', 'green', 'red', 'yellow', 'purple'];
  return typeof color === 'string' && allowedColors.includes(color);
}

// ============================================================================
// ICON MANAGEMENT
// ============================================================================

/**
 * Initialize icon color based on active profile
 */
async function initializeIconColor(): Promise<void> {
  try {
    const syncResult = await chrome.storage.sync.get(['activeProfileId']);
    const localResult = await chrome.storage.local.get(['profiles']);
    const profiles = localResult.profiles || [];
    const activeProfile = profiles.find((p: any) => p.id === syncResult.activeProfileId);
    
    if (activeProfile?.color) {
      updateIconColor(activeProfile.color);
      Logger.info('Initialized icon with profile color', { color: activeProfile.color });
    } else {
      updateIconColor('blue'); // Default color
      Logger.info('Initialized icon with default color: blue');
    }
  } catch (error) {
    Logger.error('Failed to initialize icon color', error);
    updateIconColor('blue'); // Fallback to default
  }
}

/**
 * Generate colored icon and update extension icon
 */
function updateIconColor(color: string): void {
  const colors: Record<string, string> = {
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
  const imageData: Record<number, ImageData> = {};
  
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
  Logger.debug('Icon updated with color', { color, hexColor });
}

/**
 * Apply startup profile on extension initialization
 */
async function applyStartupProfile(): Promise<void> {
  try {
    const syncResult = await chrome.storage.sync.get(['settings', 'activeProfileId']);
    const localResult = await chrome.storage.local.get(['profiles']);
    
    const profiles = localResult.profiles || [];
    const settings = syncResult.settings || {};
    const startupProfileId = settings.startupProfile;
    
    Logger.debug('Checking startup profile', { 
      startupProfileId, 
      currentActiveProfileId: syncResult.activeProfileId 
    });
    
    // If there's a startup profile set and it's different from current, apply it
    if (startupProfileId && startupProfileId !== syncResult.activeProfileId) {
      const startupProfile = profiles.find((p: any) => p.id === startupProfileId);
      
      if (startupProfile) {
        Logger.info('Applying startup profile', { name: startupProfile.name });
        
        // Update active profile
        await chrome.storage.sync.set({ activeProfileId: startupProfileId });
        
        // Build and apply proxy config
        let config: chrome.proxy.ProxyConfig;
        
        if (startupProfile.profileType === 'DirectProfile') {
          config = { mode: 'direct' };
        } else if (startupProfile.profileType === 'SystemProfile') {
          config = { mode: 'system' };
        } else if (startupProfile.profileType === 'FixedProfile') {
          const bypassList: string[] = [];
          if (startupProfile.bypassList && Array.isArray(startupProfile.bypassList)) {
            startupProfile.bypassList.forEach((condition: any) => {
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
        } else {
          config = { mode: 'direct' };
        }
        
        await handleSetProxy(config);
        
        // Update icon color
        if (startupProfile.color) {
          updateIconColor(startupProfile.color);
        }
      }
    } else {
      Logger.debug('No startup profile change needed');
    }
  } catch (error) {
    Logger.error('Failed to apply startup profile', error);
  }
}

// Check conflicts immediately on startup
checkProxyConflicts();

// Initialize icon color based on active profile
initializeIconColor();

// Apply startup profile
applyStartupProfile();

// Listen for network errors to capture failed requests and aid debugging
// Note: Requires "webRequest" permission and appropriate host permissions in manifest
try {
  if (chrome.webRequest && chrome.webRequest.onErrorOccurred && chrome.webRequest.onErrorOccurred.addListener) {
    chrome.webRequest.onErrorOccurred.addListener((details: any) => {
      try {
        Logger.warn('Request failed', {
          url: details.url,
          error: details.error,
          method: details.method,
          tabId: details.tabId,
          frameId: details.frameId,
          requestId: details.requestId,
          timeStamp: details.timeStamp
        });
      } catch (err) {
        Logger.error('Error logging request failure', err);
      }
    }, { urls: ['<all_urls>'] });
  }
} catch (e) {
  Logger.error('Failed to register webRequest.onErrorOccurred listener', e);
}

// Listen for extension installation
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    Logger.info('Extension installed');
    // Initialize default settings including log level
    chrome.storage.local.set({
      logLevel: 1, // LogLevel.INFO
      logMaxLines: 1000
    });
    chrome.storage.sync.set({
      profiles: [],
      activeProfile: 'direct',
    });
  }
  // Check for conflicts on install/update
  checkProxyConflicts();
});

// Listen for messages from popup/options
chrome.runtime.onMessage.addListener((message: ExtensionMessage, sender, sendResponse) => {
  // Security: Validate sender is from this extension
  if (sender.id !== chrome.runtime.id) {
    Logger.warn('Rejected message from unknown sender', { senderId: sender.id });
    sendResponse({ success: false, error: 'Invalid sender' });
    return false;
  }
  
  // Security: Rate limiting (prevent message spam)
  const senderId = sender.tab?.id?.toString() || sender.url || 'unknown';
  const now = Date.now();
  const lastMessage = messageRateLimit.get(senderId) || 0;
  
  if (now - lastMessage < RATE_LIMIT_MS) {
    Logger.warn('Rate limit exceeded', { senderId, timeSinceLastMessage: now - lastMessage });
    sendResponse({ success: false, error: 'Rate limit exceeded' });
    return false;
  }
  
  messageRateLimit.set(senderId, now);
  
  // Security: Validate action is in whitelist
  if (!message.action || !isAllowedAction(message.action)) {
    Logger.warn('Rejected unknown action', { action: message.action });
    sendResponse({ success: false, error: 'Unknown action' });
    return false;
  }
  
  if (message.action === 'setProxy') {
    // Security: Validate proxy configuration structure
    if (!isValidProxyConfig(message.config)) {
      Logger.warn('Rejected invalid proxy config', { config: message.config });
      sendResponse({ success: false, error: 'Invalid proxy configuration' });
      return false;
    }
    
    // Security: Validate color if provided
    if (message.profileColor && !isValidColor(message.profileColor)) {
      Logger.warn('Rejected invalid color', { color: message.profileColor });
      sendResponse({ success: false, error: 'Invalid color' });
      return false;
    }
    
    (async () => {
      try {
        await handleSetProxy(message.config);
        if (message.profileColor) {
          updateIconColor(message.profileColor);
        }
        sendResponse({ success: true });
      } catch (error) {
        Logger.error('Failed to set proxy', error);
        sendResponse({ success: false, error: String(error) });
      }
    })();
    return true; // Keep channel open for async response
  } else if (message.action === 'checkConflicts') {
    checkProxyConflicts().then(() => sendResponse({ success: true }));
    return true; // Keep channel open for async response
  }
  
  // This should never be reached due to whitelist check - all cases handled above
  return false;
});

// Monitor proxy settings changes (with delay to allow changes to propagate)
chrome.proxy.settings.onChange.addListener((details: any) => {
  Logger.debug('Proxy settings changed', { 
    levelOfControl: details.levelOfControl 
  });
  
  // Check levelOfControl directly from the onChange event
  if (details.levelOfControl === 'controlled_by_other_extensions') {
    Logger.warn('Detected control by another extension');
    chrome.action.setBadgeText({ text: '!' });
    chrome.action.setBadgeBackgroundColor({ color: '#DC2626' });
    chrome.action.setTitle({ 
      title: 'SwitchyMalaccamax - Conflict: Another extension has higher priority' 
    });
  } else if (details.levelOfControl === 'not_controllable') {
    Logger.warn('Detected not_controllable');
    chrome.action.setBadgeText({ text: '?' });
    chrome.action.setBadgeBackgroundColor({ color: '#F59E0B' });
    chrome.action.setTitle({ 
      title: 'SwitchyMalaccamax - Warning: Proxy cannot be controlled' 
    });
  } else if (details.levelOfControl === 'controlled_by_this_extension') {
    Logger.debug('Confirmed control via onChange');
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
async function checkProxyConflicts(): Promise<void> {
  try {
    const proxySettings = await chrome.proxy.settings.get({}) as any;
    const levelOfControl = proxySettings.levelOfControl;
    
    Logger.debug('Conflict check', { 
      levelOfControl, 
      config: proxySettings.value 
    });
    
    if (levelOfControl === 'controlled_by_other_extensions') {
      // Another extension has higher priority - show red badge
      await chrome.action.setBadgeText({ text: '!' });
      await chrome.action.setBadgeBackgroundColor({ color: '#DC2626' }); // red-600
      await chrome.action.setTitle({ 
        title: 'SwitchyMalaccamax - Conflict: Another extension has higher priority' 
      });
      Logger.warn('Proxy controlled by another extension');
    } else if (levelOfControl === 'controlled_by_this_extension') {
      // This extension has control - clear badge completely
      await chrome.action.setBadgeText({ text: '' });
      await chrome.action.setBadgeBackgroundColor({ color: [0, 0, 0, 0] }); // Transparent
      await chrome.action.setTitle({ title: 'SwitchyMalaccamax - Proxy Switcher' });
      Logger.debug('Proxy controlled by this extension');
    } else if (levelOfControl === 'controllable_by_this_extension') {
      // Can take control but hasn't - clear badge completely
      await chrome.action.setBadgeText({ text: '' });
      await chrome.action.setBadgeBackgroundColor({ color: [0, 0, 0, 0] }); // Transparent
      await chrome.action.setTitle({ title: 'SwitchyMalaccamax - Proxy Switcher' });
      Logger.debug('Proxy controllable by this extension');
    } else {
      // Not controllable (policy/system) - show amber warning
      await chrome.action.setBadgeText({ text: '?' });
      await chrome.action.setBadgeBackgroundColor({ color: '#F59E0B' }); // amber-500
      await chrome.action.setTitle({ 
        title: 'SwitchyMalaccamax - Warning: Proxy cannot be controlled' 
      });
      Logger.warn('Proxy not controllable');
    }
  } catch (error) {
    Logger.error('Failed to check proxy conflicts', error);
  }
}

/**
 * Apply proxy configuration
 */
async function handleSetProxy(config: chrome.proxy.ProxyConfig): Promise<void> {
  try {
    await chrome.proxy.settings.set({
      value: config,
      scope: 'regular',
    });
    Logger.info('Proxy set successfully');
    
    // Check for conflicts immediately and again after a delay
    await checkProxyConflicts();
    setTimeout(() => checkProxyConflicts(), 500);
    setTimeout(() => checkProxyConflicts(), 1500);
  } catch (error) {
    Logger.error('Failed to set proxy', error);
    // Check conflicts even on error to show current state
    await checkProxyConflicts();
  }
}

export {};
