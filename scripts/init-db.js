// DB 초기 셋업: schema.sql + seed.sql 적용
// 실행: node scripts/init-db.js
import { Client, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';
import fs from 'node:fs';
import path from 'node:path';

neonConfig.webSocketConstructor = ws;

// .env.local 로드 (없으면 시스템 환경변수만 사용)
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const eq = t.indexOf('=');
    if (eq === -1) continue;
    const k = t.slice(0, eq).trim();
    const v = t.slice(eq + 1).trim();
    if (!process.env[k]) process.env[k] = v;
  }
}

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL 이 설정되지 않았습니다. .env.local 을 확인하세요.');
  process.exit(1);
}

const client = new Client(process.env.DATABASE_URL);

try {
  await client.connect();
  console.log('✓ Neon 연결 성공');

  console.log('▸ schema.sql 적용 중...');
  await client.query(fs.readFileSync('schema.sql', 'utf8'));
  console.log('✓ schema 적용 완료');

  console.log('▸ seed.sql 적용 중...');
  await client.query(fs.readFileSync('seed.sql', 'utf8'));
  console.log('✓ seed 적용 완료');

  const { rows } = await client.query('SELECT COUNT(*)::int AS n FROM trainees');
  console.log(`✓ trainees 테이블 행 수: ${rows[0].n}`);
  console.log('\n🎉 DB 셋업 완료');
} catch (err) {
  console.error('❌ 오류:', err.message);
  process.exitCode = 1;
} finally {
  await client.end();
}
