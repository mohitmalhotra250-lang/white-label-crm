import { pool } from '../lib/db';
export class NotificationService {
  static async send(userId: string, clientId: string, type: string, msg: string) {
    await pool.query('INSERT INTO notifications (user_id,client_id,type,message,is_read) VALUES ($1,$2,$3,$4,FALSE)', [userId, clientId, type, msg]);
  }
  static async sendInApp(userId: string, clientId: string, msg: string) { await this.send(userId, clientId, 'calling_started', msg); }
  static async sendEmail(to: string, subject: string, body: string) { /* Integrate with SendGrid/AWS SES */ console.log('[EMAIL]', to, subject); }
  static async sendWhatsApp(to: string, msg: string) { /* Integrate with WhatsApp Business API */ console.log('[WHATSAPP]', to, msg); }
  static async sendWebhook(url: string, payload: any) { /* Call webhook endpoint with secret */ console.log('[WEBHOOK]', url, payload); }
}
