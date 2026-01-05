/**
 * Status Components - Barrel Export
 */

export { default as ConnectionStatusCard } from './ConnectionStatusCard.vue';

// Re-export types
export interface ConnectionStatus {
  status: 'active' | 'auto' | 'direct' | 'error' | 'disconnected';
  activeProfile?: string;
  connectionMode: 'Manual' | 'Auto Switch' | 'Direct';
  requestCount?: number;
  lastSwitched?: Date | number;
  proxyType?: string;
  proxyHost?: string;
  rulesCount?: number;
}
