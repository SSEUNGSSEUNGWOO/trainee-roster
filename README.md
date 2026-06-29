# AI 챔피언 참여자 명단 확인

참여자가 본인 소속 정보를 확인하고 직접 수정/확인 완료 처리할 수 있는 웹앱입니다.

## 구조
- 프론트엔드: 정적 `index.html`
- API: Vercel Serverless Function `api/trainees.js`
- DB: Neon Postgres

## 파일
```text
trainee-roster/
├── index.html          # 참여자 확인/수정 화면
├── api/trainees.js     # GET/PATCH API
├── schema.sql          # Neon 테이블/트리거
├── seed.sql            # 초기 명단 75명
├── scripts/init-db.js  # schema + seed 적용 스크립트
└── .env.local.example
```

## Neon DB 셋업
1. Neon Console에서 프로젝트를 만들고 connection string을 복사합니다.
2. `.env.local.example`을 `.env.local`로 복사합니다.
3. `.env.local`의 `DATABASE_URL=` 뒤에 connection string을 넣습니다.
4. 아래 명령으로 테이블과 초기 명단을 적용합니다.

```powershell
npm install
node scripts/init-db.js
```

## 로컬 실행
```powershell
npm run dev
```

브라우저에서 `http://localhost:3000`으로 접속합니다.

## 배포
Vercel 프로젝트 환경변수에 `DATABASE_URL`을 등록한 뒤 배포합니다.

```powershell
vercel --prod
```

## API

`GET /api/trainees`
- 전체 명단 조회

`PATCH /api/trainees`
- 개별 행 수정 또는 원본 복원

수정 예시:
```json
{
  "no": 1,
  "name": "구윤모",
  "org_type": "광역지자체",
  "org": "서울특별시",
  "dept": "데이터센터 인터넷통신과",
  "rank": "주무관",
  "modified": true,
  "done": true,
  "reason": "부서명 수정"
}
```

## 운영 메모
- 현재 인증은 없습니다. 링크를 아는 사용자는 모든 행을 수정할 수 있습니다.
- 운영자는 Neon SQL Editor에서 수정 내역을 조회하거나 CSV로 내려받을 수 있습니다.

```sql
SELECT no, cohort, name, org_type, org, dept, rank, modified, done, reason, updated_at
FROM trainees
ORDER BY no;
```
