import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  try {
    if (req.method === 'GET') {
      const rows = await sql`
        SELECT no, ki, name, dept, type, modified, done, reason, updated_at
        FROM trainees
        ORDER BY no ASC
      `;
      return res.status(200).json(rows);
    }

    if (req.method === 'PATCH') {
      const { no, name, dept, type, modified, done, reason } = req.body ?? {};
      if (!no || !name || !dept || !type) {
        return res.status(400).json({ error: 'no, name, dept, type are required' });
      }
      const rows = await sql`
        UPDATE trainees
        SET name = ${name},
            dept = ${dept},
            type = ${type},
            modified = ${Boolean(modified)},
            done = ${Boolean(done)},
            reason = ${reason ?? null}
        WHERE no = ${no}
        RETURNING no, ki, name, dept, type, modified, done, reason, updated_at
      `;
      if (rows.length === 0) {
        return res.status(404).json({ error: 'Not found' });
      }
      return res.status(200).json(rows[0]);
    }

    res.setHeader('Allow', 'GET, PATCH');
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('[api/trainees] error:', err);
    return res.status(500).json({ error: 'Internal error' });
  }
}
