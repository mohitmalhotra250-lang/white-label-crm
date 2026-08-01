import { AdapterFactory, ProviderAdapter, NormalizedCall, StartCallParams } from '../../../adapter';
import { pool } from '../lib/db';

export class AdapterService {
  static async getProviderConfig(providerId: string) {
    const res = await pool.query(
      'SELECT name, api_key_encrypted, base_url FROM providers WHERE id = $1 AND enabled = TRUE',
      [providerId]
    );
    return res.rows[0] || null;
  }

  static async getAdapterByName(name: string, apiKey: string, baseUrl?: string): Promise<ProviderAdapter> {
    return AdapterFactory.create(name as any, { apiKey, baseUrl: baseUrl || undefined });
  }

  static async startCall(params: StartCallParams, providerName: string, apiKey: string, baseUrl?: string): Promise<NormalizedCall> {
    const adapter = await this.getAdapterByName(providerName, apiKey, baseUrl);
    return adapter.startCall(params);
  }

  static async getStatus(providerCallId: string, providerName: string, apiKey: string, baseUrl?: string) {
    const adapter = await this.getAdapterByName(providerName, apiKey, baseUrl);
    return adapter.getStatus(providerCallId);
  }

  static async getTranscript(providerCallId: string, providerName: string, apiKey: string, baseUrl?: string) {
    const adapter = await this.getAdapterByName(providerName, apiKey, baseUrl);
    return adapter.getTranscript(providerCallId);
  }

  static async getRecording(providerCallId: string, providerName: string, apiKey: string, baseUrl?: string) {
    const adapter = await this.getAdapterByName(providerName, apiKey, baseUrl);
    return adapter.getRecording(providerCallId);
  }

  static async getSummary(providerCallId: string, providerName: string, apiKey: string, baseUrl?: string) {
    const adapter = await this.getAdapterByName(providerName, apiKey, baseUrl);
    return adapter.getSummary(providerCallId);
  }

  static async testConnection(name: string, apiKey: string, baseUrl?: string) {
    const adapter = await this.getAdapterByName(name, apiKey, baseUrl);
    return adapter.testConnection();
  }
}
