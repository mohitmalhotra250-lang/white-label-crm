import { ProviderAdapter } from './provider-adapter';
import { VapiAdapter } from './vapi-adapter';
import { RetellAdapter } from './retell-adapter';
import { BlandAdapter } from './bland-adapter';
import { TabblyAdapter } from './tabbly-adapter';
import { GrokAdapter } from './grok-adapter';
import { ElevenLabsAdapter } from './elevenlabs-adapter';
import { CustomAdapter } from './custom-adapter';

// ===================================================================
// Provider Adapter Registry
// Adding a new provider requires ONLY:
// 1. Create adapter/new-provider-adapter.ts
// 2. Import and register below
// Zero frontend or database schema changes required.
// ===================================================================

export type ProviderName = 'Vapi' | 'Retell' | 'Bland' | 'Tabbly' | 'Grok' | 'ElevenLabs' | 'Custom' | string;

export class AdapterFactory {
  static create(name: ProviderName, config: { apiKey: string; baseUrl?: string }): ProviderAdapter {
    switch (name) {
      case 'Vapi':
        return new VapiAdapter(config.apiKey, config.baseUrl);
      case 'Retell':
        return new RetellAdapter(config.apiKey, config.baseUrl);
      case 'Bland':
        return new BlandAdapter(config.apiKey, config.baseUrl);
      case 'Tabbly':
        return new TabblyAdapter(config.apiKey, config.baseUrl);
      case 'Grok':
        return new GrokAdapter(config.apiKey, config.baseUrl);
      case 'ElevenLabs':
        return new ElevenLabsAdapter(config.apiKey, config.baseUrl);
      case 'Custom':
        return new CustomAdapter(config.apiKey, config.baseUrl);
      case 'Tabbly':
        throw new Error('Tabbly adapter not yet implemented.');
      case 'Grok':
        throw new Error('Grok adapter not yet implemented.');
      case 'ElevenLabs':
        throw new Error('ElevenLabs adapter not yet implemented.');
      default:
        throw new Error(`Unknown provider: ${name}. Add adapter and register in AdapterFactory.`);
    }
  }
}

export { ProviderAdapter, StartCallParams, NormalizedCall, CallStatusResult, TranscriptResult, RecordingResult, SummaryResult, HealthCheckResult } from './provider-adapter';
export { VapiAdapter } from './vapi-adapter';
export { RetellAdapter } from './retell-adapter';
