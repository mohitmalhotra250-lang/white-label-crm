import { ProviderAdapter, StartCallParams, NormalizedCall, CallStatusResult, TranscriptResult, RecordingResult, SummaryResult, HealthCheckResult } from './provider-adapter';
export class CustomAdapter extends ProviderAdapter {
  get name() { return 'Custom'; }
  async startCall(p: StartCallParams): Promise<NormalizedCall> { return { providerCallId: 'cu-' + Date.now(), status: 'dialing' }; }
  async pauseCall(id: string): Promise<NormalizedCall> { return { providerCallId: id, status: 'talking' }; }
  async resumeCall(id: string): Promise<NormalizedCall> { return { providerCallId: id, status: 'talking' }; }
  async stopCall(id: string): Promise<NormalizedCall> { return { providerCallId: id, status: 'completed' }; }
  async getStatus(id: string): Promise<CallStatusResult> { return { providerCallId: id, status: 'completed' }; }
  async getTranscript(id: string): Promise<TranscriptResult> { return { providerCallId: id, text: 'Custom transcript' }; }
  async getRecording(id: string): Promise<RecordingResult> { return { providerCallId: id, recordingUrl: 'https://example.com/custom.mp3' }; }
  async getSummary(id: string): Promise<SummaryResult> { return { providerCallId: id, aiSummary: 'Custom summary', leadScore: 75 }; }
  async testConnection(): Promise<HealthCheckResult> { return { ok: true, message: 'Custom OK' }; }
}
