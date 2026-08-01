import { ProviderAdapter, StartCallParams, NormalizedCall, CallStatusResult, TranscriptResult, RecordingResult, SummaryResult, HealthCheckResult } from './provider-adapter';
export class TabblyAdapter extends ProviderAdapter {
  get name() { return 'Tabbly'; }
  async startCall(p: StartCallParams): Promise<NormalizedCall> { return { providerCallId: 'tb-' + Date.now(), status: 'dialing' }; }
  async pauseCall(id: string): Promise<NormalizedCall> { return { providerCallId: id, status: 'talking' }; }
  async resumeCall(id: string): Promise<NormalizedCall> { return { providerCallId: id, status: 'talking' }; }
  async stopCall(id: string): Promise<NormalizedCall> { return { providerCallId: id, status: 'completed' }; }
  async getStatus(id: string): Promise<CallStatusResult> { return { providerCallId: id, status: 'completed' }; }
  async getTranscript(id: string): Promise<TranscriptResult> { return { providerCallId: id, text: 'Tabbly transcript' }; }
  async getRecording(id: string): Promise<RecordingResult> { return { providerCallId: id, recordingUrl: 'https://example.com/tabbly.mp3' }; }
  async getSummary(id: string): Promise<SummaryResult> { return { providerCallId: id, aiSummary: 'Tabbly summary' }; }
  async testConnection(): Promise<HealthCheckResult> { return { ok: true, message: 'Tabbly OK' }; }
}
