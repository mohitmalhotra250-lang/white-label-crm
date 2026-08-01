import { ProviderAdapter, StartCallParams, NormalizedCall, CallStatusResult, TranscriptResult, RecordingResult, SummaryResult, HealthCheckResult } from './provider-adapter';
export class BlandAdapter extends ProviderAdapter {
  get name() { return 'Bland'; }
  async startCall(p: StartCallParams): Promise<NormalizedCall> { return { providerCallId: 'bl-' + Date.now(), status: 'dialing' }; }
  async pauseCall(id: string): Promise<NormalizedCall> { return { providerCallId: id, status: 'talking' }; }
  async resumeCall(id: string): Promise<NormalizedCall> { return { providerCallId: id, status: 'talking' }; }
  async stopCall(id: string): Promise<NormalizedCall> { return { providerCallId: id, status: 'completed' }; }
  async getStatus(id: string): Promise<CallStatusResult> { return { providerCallId: id, status: 'completed' }; }
  async getTranscript(id: string): Promise<TranscriptResult> { return { providerCallId: id, text: 'Bland transcript' }; }
  async getRecording(id: string): Promise<RecordingResult> { return { providerCallId: id, recordingUrl: 'https://example.com/bland.mp3' }; }
  async getSummary(id: string): Promise<SummaryResult> { return { providerCallId: id, aiSummary: 'Bland summary' }; }
  async testConnection(): Promise<HealthCheckResult> { return { ok: true, message: 'Bland OK' }; }
}
