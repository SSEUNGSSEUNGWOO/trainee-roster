import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  try {
    if (req.method === 'GET') {
      const rows = await sql`
        SELECT no, cohort, name, org_type, org, dept, rank, modified, done, reason, updated_at
        FROM trainees
        ORDER BY no ASC
      `;
      return res.status(200).json(rows);
    }

    if (req.method === 'PATCH') {
      const body = req.body ?? {};
      const { no, reset } = body;
      if (!no) {
        return res.status(400).json({ error: 'no is required' });
      }

      // 원본 복원 모드
      if (reset === true) {
        const rows = await sql`
          UPDATE trainees
          SET name = orig_name,
              org_type = orig_org_type,
              org = orig_org,
              dept = orig_dept,
              rank = orig_rank,
              modified = FALSE,
              done = FALSE,
              reason = NULL
          WHERE no = ${no}
          RETURNING no, cohort, name, org_type, org, dept, rank, modified, done, reason, updated_at
        `;
        if (rows.length === 0) {
          return res.status(404).json({ error: 'Not found' });
        }
        return res.status(200).json(rows[0]);
      }

      // 일반 수정 모드
      const { name, org_type, org, dept, rank, modified, done, reason } = body;
      if (!name || !org_type || !org) {
        return res.status(400).json({ error: 'name, org_type, org are required' });
      }
      const rows = await sql`
        UPDATE trainees
        SET name = ${name},
            org_type = ${org_type},
            org = ${org},
            dept = ${dept ?? ''},
            rank = ${rank ?? ''},
            modified = ${Boolean(modified)},
            done = ${Boolean(done)},
            reason = ${reason ?? null}
        WHERE no = ${no}
        RETURNING no, cohort, name, org_type, org, dept, rank, modified, done, reason, updated_at
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
