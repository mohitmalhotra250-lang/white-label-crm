// Integration adapter stubs — connect to external CRMs via their APIs
export class IntegrationAdapter {
  constructor(private config: { apiKey: string; baseUrl?: string }) {}
  async syncToGoogleSheets(data: any[]) { console.log('[Google Sheets] sync', data.length); return { ok: true, rows: data.length }; }
  async syncToHubSpot(leads: any[]) { console.log('[HubSpot] sync', leads.length); return { ok: true }; }
  async syncToZoho(leads: any[]) { console.log('[Zoho] sync', leads.length); return { ok: true }; }
  async syncToSalesforce(leads: any[]) { console.log('[Salesforce] sync', leads.length); return { ok: true }; }
  async syncToZapier(webhookUrl: string, payload: any) { console.log('[Zapier] webhook', webhookUrl); return { ok: true }; }
  async syncToN8n(webhookUrl: string, payload: any) { console.log('[n8n] webhook', webhookUrl); return { ok: true }; }
}
