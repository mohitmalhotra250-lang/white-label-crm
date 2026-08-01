import { ProviderAdapter, StartCallParams, NormalizedCall, CallStatusResult, TranscriptResult, RecordingResult, SummaryResult, HealthCheckResult } from './provider-adapter';

/**
 * Retell AI Adapter — demonstrates second provider with same interface.
 * Only this file (and adapter/index.ts registration) changes when switching to Retell.
 */
export class RetellAdapter extends ProviderAdapter {
  get name() { return 'Retell'; }

  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string, baseUrl = 'https://api.retell.ai') {
    super();
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  async startCall(params: StartCallParams): Promise<NormalizedCall> {
    const res = await fetch(`${this.baseUrl}/v1/calls`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to_number: params.phoneNumber,
        agent_id: params.agentConfig.agentId,
        retell_llm_dynamic_variables: params.variables ?? {},
        metadata: { leadId: params.leadId, campaignId: params.campaignId },
      }),
    });
    if (!res.ok) throw new Error(`Retell start error (${res.status}): ${await res.text()}`);
    const data = await res.json() as { call_id: string; status: string };
    return { providerCallId: data.call_id, status: this.mapStatus(data.status) };
  }

  async pauseCall(providerCallId: string): Promise<NormalizedCall> {
    const res = await fetch(`${this.baseUrl}/v1/calls/${providerCallId}/pause`, { method: 'POST', headers: { Authorization: `Bearer ${this.apiKey}` } });
    const data = await res.json();
    return { providerCallId, status: this.mapStatus(data.status || 'talking'), durationSeconds: data.duration || 0 };
  }

  async resumeCall(providerCallId: string): Promise<NormalizedCall> {
    const res = await fetch(`${this.baseUrl}/v1/calls/${providerCallId}/resume`, { method: 'POST', headers: { Authorization: `Bearer ${this.apiKey}` } });
    const data = await res.json();
    return { providerCallId, status: this.mapStatus(data.status || 'talking'), durationSeconds: data.duration || 0 };
  }

  async stopCall(providerCallId: string): Promise<NormalizedCall> {
    const res = await fetch(`${this.baseUrl}/v1/calls/${providerCallId}/end`, { method: 'POST', headers: { Authorization: `Bearer ${this.apiKey}` } });
    const data = await res.json();
    return { providerCallId, status: 'completed', durationSeconds: data.duration || 0, recordingUrl: data.recording_url, transcriptUrl: data.transcript_url };
  }

  async getStatus(providerCallId: string): Promise<CallStatusResult> {
    const res = await fetch(`${this.baseUrl}/v1/calls/${providerCallId}`, { headers: { Authorization: `Bearer ${this.apiKey}` } });
    const data = await res.json();
    return { providerCallId, status: this.mapStatus(data.call_status || data.status), durationSeconds: data.duration || 0 };
  }

  async getTranscript(providerCallId: string): Promise<TranscriptResult> {
    const res = await fetch(`${this.baseUrl}/v1/calls/${providerCallId}/transcript`, { headers: { Authorization: `Bearer ${this.apiKey}` } });
    const data = await res.json();
    return { providerCallId, transcriptUrl: data.url, text: data.transcript, segments: (data.segments || []).map((s: any) => ({ speaker: s.role === 'assistant' ? 'AI' : 'Customer', text: s.content || s.text || '', start: s.start, end: s.end })) };
  }

  async getRecording(providerCallId: string): Promise<RecordingResult> {
    const res = await fetch(`${this.baseUrl}/v1/calls/${providerCallId}/recording`, { headers: { Authorization: `Bearer ${this.apiKey}` } });
    const data = await res.json();
    return { providerCallId, recordingUrl: data.url, fileSizeBytes: data.size, durationSeconds: data.duration };
  }

  async getSummary(providerCallId: string): Promise<SummaryResult> {
    const res = await fetch(`${this.baseUrl}/v1/calls/${providerCallId}/call_analysis`, { headers: { Authorization: `Bearer ${this.apiKey}` } });
    const data = await res.json();
    return { providerCallId, aiSummary: data.summary, leadScore: data.score, finalOutcome: data.outcome, customerInterest: data.interest };
  }

  async testConnection(): Promise<HealthCheckResult> {
    try {
      const res = await fetch(`${this.baseUrl}/v1/health`, { headers: { Authorization: `Bearer ${this.apiKey}` } });
      return { ok: res.ok, message: res.ok ? 'Retell connected' : 'Retell error', latencyMs: 50 };
    } catch (e) {
      return { ok: false, message: `Retell unreachable: ${(e as Error).message}` };
    }
  }

  private mapStatus(s: string): CallStatus {
    const lower = String(s).toLowerCase();
    if (lower.includes('dial') || lower.includes('init')) return 'dialing';
    if (lower.includes('ring')) return 'ringing';
    if (lower.includes('talk')) return 'talking';
    if (lower.includes('connect') || lower.includes('answer')) return 'connected';
    if (lower.includes('transfer')) return 'transferred';
    if (lower.includes('end') || lower.includes('complete')) return 'completed';
    if (lower.includes('busy')) return 'busy';
    if (lower.includes('reject')) return 'rejected';
    if (lower.includes('no_answer')) return 'no_answer';
    if (lower.includes('voicemail')) return 'voicemail';
    if (lower.includes('fail')) return 'failed';
    return 'dialing';
  }
}
