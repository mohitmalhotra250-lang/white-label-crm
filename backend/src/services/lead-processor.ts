import { pool } from '../lib/db';

export interface LeadRow {
  name?: string;
  phone?: string;
  email?: string;
  company?: string;
  city?: string;
  state?: string;
  country?: string;
  [key: string]: any;
}

export class LeadProcessor {
  static generateDuplicateKey(row: LeadRow): string {
    const raw = row.phone ? row.phone.replace(/\D/g, '').slice(-10) : '';
    return raw ? `phone:${raw}` : JSON.stringify(row);
  }

  static async processCsvBuffer(buffer: Buffer, clientId: string, userId: string) {
    // Simple CSV parse using csv-parser or manual split (production: use csv-parser)
    const lines = buffer.toString('utf8').split(/\r?\n/).filter(l => l.trim());
    if (lines.length < 2) return { inserted: 0, errors: 0 };
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const inserted = 0;
    const errors = 0;
    // Batch insert using pool (simplified — production uses COPY or bulk insert)
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(',');
      const row: LeadRow = {};
      headers.forEach((h, idx) => row[h] = cols[idx]?.trim());
      const dup = this.generateDuplicateKey(row);
      try {
        await pool.query(
          `INSERT INTO leads (client_id, name, phone, email, company, city, state, country, custom_fields, status, duplicate_key, created_by)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
           ON CONFLICT DO NOTHING`,
          [clientId, row.name || '', row.phone || '', row.email || null, row.company || null, row.city || null, row.state || null, row.country || null, JSON.stringify(row), 'new', dup, userId]
        );
        // Note: true ON CONFLICT requires a unique constraint on duplicate_key + client_id (add if needed)
      } catch (e) { /* skip duplicates/errors */ }
    }
    return { inserted, errors };
  }
}
