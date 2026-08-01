import { ProviderAdapter, StartCallParams, NormalizedCall, CallStatusResult, TranscriptResult, RecordingResult, SummaryResult, HealthCheckResult } from './provider-adapter';

/**
 * Vapi Adapter — maps Vapi's Voice API to common interface.
 * Provider-specific details live ONLY in this file.
 */
export class VapiAdapter extends ProviderAdapter {
  get name() { return 'Vapi'; }

  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string, baseUrl = 'https://api.vapi.ai') {
    super();
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  async startCall(params: StartCallParams): Promise<NormalizedCall> {
    // Vapi-specific payload (example structure)
    const payload = {
      name: params.agentConfig.name,
      model: {
        provider: 'openai',
        model: params.agentConfig.name, // simplified for demo
        temperature: params.agentConfig.temperature ?? 0.7,
        messages: [
          { role: 'system', content: params.agentConfig.prompt },
          { role: 'system', content: params.agentConfig.greeting ?? '' },
        ],
      },
      voice: { provider: 'elevenlabs', voiceId: params.agentConfig.voice ?? 'Rachel' },
      phoneNumber: { number: params.phoneNumber, callerId: params.callerId },
      firstMessage: params.agentConfig.greeting ?? 'Hello, this is an automated call.',
      variables: params.variables ?? {},
    };

    const res = await fetch(`${this.baseUrl}/call/phone`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Vapi start error (${res.status}): ${err}`);
    }

    const data = await res.json() as { id: string; status: string; phoneCallProvider?: string };

    return {
      providerCallId: data.id,
      status: this.mapStatus(data.status),
      durationSeconds: 0,
      recordingUrl: undefined,
      transcriptUrl: undefined,
      aiSummary: undefined,
      cost: undefined,
    };
  }

  async pauseCall(providerCallId: string): Promise<NormalizedCall> {
    // Vapi supports pausing via endpoint (example)
    const res = await fetch(`${this.baseUrl}/call/${providerCallId}/pause`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${this.apiKey}` },
    });
    if (!res.ok) throw new Error(`Vapi pause failed: ${await res.text()}`);
    const data = await res.json();
    return { providerCallId, status: this.mapStatus(data.status || 'talking'), durationSeconds: data.duration ?? 0 };
  }

  async resumeCall(providerCallId: string): Promise<NormalizedCall> {
    const res = await fetch(`${this.baseUrl}/call/${providerCallId}/resume`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${this.apiKey}` },
    });
    if (!res.ok) throw new Error(`Vapi resume failed: ${await res.text()}`);
    const data = await res.json();
    return { providerCallId, status: this.mapStatus(data.status || 'talking'), durationSeconds: data.duration ?? 0 };
  }

  async stopCall(providerCallId: string): Promise<NormalizedCall> {
    const res = await fetch(`${this.baseUrl}/call/${providerCallId}/end`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${this.apiKey}` },
    });
    if (!res.ok) throw new Error(`Vapi stop failed: ${await res.text()}`);
    const data = await res.json();
    return { providerCallId, status: 'completed', durationSeconds: data.duration ?? 0, recordingUrl: data.recordingUrl, transcriptUrl: data.transcriptUrl };
  }

  async getStatus(providerCallId: string): Promise<CallStatusResult> {
    const res = await fetch(`${this.baseUrl}/call/${providerCallId}`, {
      headers: { Authorization: `Bearer ${this.apiKey}` },
    });
    if (!res.ok) throw new Error(`Vapi status error: ${await res.text()}`);
    const data = await res.json();
    return {
      providerCallId,
      status: this.mapStatus(data.status),
      durationSeconds: data.duration ?? 0,
      endedAt: data.endedAt || undefined,
    };
  }

  async getTranscript(providerCallId: string): Promise<TranscriptResult> {
    const res = await fetch(`${this.baseUrl}/call/${providerCallId}/transcript`, {
      headers: { Authorization: `Bearer ${this.apiKey}` },
    });
    if (!res.ok) throw new Error(`Vapi transcript error: ${await res.text()}`);
    const data = await res.json();
    return {
      providerCallId,
      transcriptUrl: data.url || undefined,
      text: data.transcript || undefined,
      segments: (data.messages || []).map((m: any) => ({
        speaker: m.role === 'assistant' ? 'AI' : 'Customer',
        text: m.message || m.content || '',
        start: m.start || undefined,
        end: m.end || undefined,
      })),
    };
  }

  async getRecording(providerCallId: string): Promise<RecordingResult> {
    const res = await fetch(`${this.baseUrl}/call/${providerCallId}/recording`, {
      headers: { Authorization: `Bearer ${this.apiKey}` },
    });
    if (!res.ok) throw new Error(`Vapi recording error: ${await res.text()}`);
    const data = await res.json();
    return {
      providerCallId,
      recordingUrl: data.url || undefined,
      fileSizeBytes: data.fileSize || undefined,
      durationSeconds: data.duration || undefined,
    };
  }

  async getSummary(providerCallId: string): Promise<SummaryResult> {
    const res = await fetch(`${this.baseUrl}/call/${providerCallId}/analysis`, {
      headers: { Authorization: `Bearer ${this.apiKey}` },
    });
    if (!res.ok) throw new Error(`Vapi summary error: ${await res.text()}`);
    const data = await res.json();
    return {
      providerCallId,
      purpose: data.purpose || undefined,
      customerInterest: data.customerInterest || undefined,
      objections: data.objections || [],
      finalOutcome: data.finalOutcome || undefined,
      followUpRecommendation: data.followUpRecommendation || undefined,
      leadScore: data.leadScore || undefined,
      aiSummary: data.summary || undefined,
    };
  }

  async testConnection(): Promise<HealthCheckResult> {
    const start = Date.now();
    try {
      const res = await fetch(`${this.baseUrl}/org`, { headers: { Authorization: `Bearer ${this.apiKey}` } });
      return { ok: res.ok, message: res.ok ? 'Vapi connected' : 'Vapi returned error', latencyMs: Date.now() - start };
    } catch (e) {
      return { ok: false, message: `Vapi unreachable: ${(e as Error).message}`, latencyMs: Date.now() - start };
    }
  }

  private mapStatus(s: string): CallStatus {
    const lower = String(s).toLowerCase();
    if (lower.includes('dial') || lower.includes('init')) return 'dialing';
    if (lower.includes('ring')) return 'ringing';
    if (lower.includes('talk') || lower.includes('conversation')) return 'talking';
    if (lower.includes('connect') || lower.includes('answer')) return 'connected';
    if (lower.includes('transfer')) return 'transferred';
    if (lower.includes('end') || lower.includes('complete')) return 'completed';
    if (lower.includes('busy')) return 'busy';
    if (lower.includes('reject') || lower.includes('decline')) return 'rejected';
    if (lower.includes('no_answer')) return 'no_answer';
    if (lower.includes('voicemail')) return 'voicemail';
    if (lower.includes('fail')) return 'failed';
    return 'dialing';
  }
}
