import { ProviderAdapter, StartCallParams, NormalizedCall, CallStatusResult, TranscriptResult, RecordingResult, SummaryResult, HealthCheckResult } from './provider-adapter';
export class GrokAdapter extends ProviderAdapter {
  get name() { return 'Grok'; }
  async startCall(p: StartCallParams): Promise<NormalizedCall> { return { providerCallId: 'gr-' + Date.now(), status: 'dialing' }; }
  async pauseCall(id: string): Promise<NormalizedCall> { return { providerCallId: id, status: 'talking' }; }
  async resumeCall(id: string): Promise<NormalizedCall> { return { providerCallId: id, status: 'talking' }; }
  async stopCall(id: string): Promise<NormalizedCall> { return { providerCallId: id, status: 'completed' }; }
  async getStatus(id: string): Promise<CallStatusResult> { return { providerCallId: id, status: 'completed' }; }
  async getTranscript(id: string): Promise<TranscriptResult> { return { providerCallId: id, text: 'Grok transcript' }; }
  async getRecording(id: string): Promise<RecordingResult> { return { providerCallId: id, recordingUrl: 'https://example.com/grok.mp3' }; }
  async getSummary(id: string): Promise<SummaryResult> { return { providerCallId: id, aiSummary: 'Grok summary', leadScore: 88 }; }
  async testConnection(): Promise<HealthCheckResult> { return { ok: true, message: 'Grok OK' }; }
}
