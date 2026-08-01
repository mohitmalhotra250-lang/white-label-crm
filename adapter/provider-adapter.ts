// ===================================================================
// Provider Adapter Layer — Abstract Interface
// Every provider returns a COMMON FORMAT. No frontend depends on any provider.
// ===================================================================

export type CallStatus =
  | 'dialing'
  | 'ringing'
  | 'connected'
  | 'talking'
  | 'transferred'
  | 'completed'
  | 'busy'
  | 'rejected'
  | 'no_answer'
  | 'voicemail'
  | 'failed'
  | 'retrying';

export interface StartCallParams {
  agentConfig: AgentConfig;
  phoneNumber: string;
  leadId: string;
  campaignId?: string;
  variables?: Record<string, string | number | boolean>;
  callerId?: string;
}

export interface AgentConfig {
  agentId: string;
  name: string;
  prompt: string;
  voice?: string;
  language?: string;
  greeting?: string;
  knowledgeBase?: string;
  callFlow?: Record<string, unknown>;
  temperature?: number;
}

export interface NormalizedCall {
  providerCallId: string;
  status: CallStatus;
  durationSeconds?: number;
  recordingUrl?: string;
  transcriptUrl?: string;
  aiSummary?: string;
  sentiment?: 'positive' | 'neutral' | 'negative';
  cost?: number; // Provider-reported cost (for billing)
  errorMessage?: string;
  speakerLabels?: Array<{ speaker: 'AI' | 'Customer'; text: string; timestamp?: string }>;
  transcriptText?: string;
}

export interface CallStatusResult {
  providerCallId: string;
  status: CallStatus;
  durationSeconds?: number;
  endedAt?: string;
}

export interface TranscriptResult {
  providerCallId: string;
  transcriptUrl?: string;
  text?: string;
  segments?: Array<{ speaker: 'AI' | 'Customer'; text: string; start?: number; end?: number }>;
}

export interface RecordingResult {
  providerCallId: string;
  recordingUrl?: string;
  fileSizeBytes?: number;
  durationSeconds?: number;
}

export interface SummaryResult {
  providerCallId: string;
  purpose?: string;
  customerInterest?: string;
  objections?: string[];
  finalOutcome?: string;
  followUpRecommendation?: string;
  leadScore?: number; // 0-100
  aiSummary?: string;
}

export interface HealthCheckResult {
  ok: boolean;
  message?: string;
  latencyMs?: number;
}

// ===================================================================
// Abstract Provider Adapter
// ===================================================================
export abstract class ProviderAdapter {
  abstract get name(): string; // "Vapi", "Retell", "Bland", "Tabbly", "Grok", "ElevenLabs"

  // Core calling operations
  abstract startCall(params: StartCallParams): Promise<NormalizedCall>;
  abstract pauseCall(providerCallId: string): Promise<NormalizedCall>;
  abstract resumeCall(providerCallId: string): Promise<NormalizedCall>;
  abstract stopCall(providerCallId: string): Promise<NormalizedCall>;

  // Status / retrieval
  abstract getStatus(providerCallId: string): Promise<CallStatusResult>;
  abstract getTranscript(providerCallId: string): Promise<TranscriptResult>;
  abstract getRecording(providerCallId: string): Promise<RecordingResult>;
  abstract getSummary(providerCallId: string): Promise<SummaryResult>;

  // Provider management
  abstract testConnection(): Promise<HealthCheckResult>;

  // Helper: normalize provider errors into user-friendly messages
  protected normalizeError(error: unknown, context: string): { message: string; retryable: boolean } {
    const msg = error instanceof Error ? error.message : String(error);
    const retryable = /(timeout|rate.?limit|network|temporarily|retry)/i.test(msg) || msg.length < 50;
    return { message: `[${this.name}] ${context}: ${msg}`, retryable };
  }
}
