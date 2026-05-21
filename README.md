# 23-1기 교육생 명단 확인

교육생이 본인 정보를 확인/수정하고 "확인 완료" 표시를 할 수 있는 단일 페이지 웹앱.

## 스택
- 프론트엔드: 정적 HTML/CSS/JS
- 백엔드: Vercel Serverless Functions (Node.js, ESM)
- DB: Neon Postgres (`@neondatabase/serverless`)
- 호스팅: Vercel

## 폴더 구조
```
trainee-roster/
├── index.html              # 교육생용 페이지
├── api/
│   └── trainees.js         # GET / PATCH 핸들러
├── schema.sql              # 테이블 + 트리거
├── seed.sql                # 18명 초기 데이터
├── package.json
├── .env.local.example
└── .gitignore
```

## 셋업

### 1. DB 셋업 (Neon)

1. [Neon Console](https://console.neon.tech) → 프로젝트 → **SQL Editor**
2. `schema.sql` 내용 붙여넣고 **Run**
3. `seed.sql` 내용 붙여넣고 **Run** (18명 초기 데이터 삽입)
4. **Connection Details** 에서 connection string 복사

### 2. 로컬 환경변수

`.env.local.example` → `.env.local` 로 복사하고 `DATABASE_URL` 채우기:
```powershell
Copy-Item .env.local.example .env.local
# .env.local 열어서 DATABASE_URL 붙여넣기
```

### 3. 로컬 실행
```powershell
npm install
npx vercel dev
# http://localhost:3000
```

### 4. Vercel 배포
```powershell
npm install -g vercel
vercel login
vercel             # 첫 배포 (프로젝트 연결, 질문에 따라 답하기)
vercel --prod      # 프로덕션 배포
```

배포 후 **Vercel 대시보드 → Project → Settings → Environment Variables** 에서
`DATABASE_URL` 을 **Production / Preview / Development** 셋 다 등록.
환경변수 추가 후 한 번 더 `vercel --prod` 로 재배포.

## API

### `GET /api/trainees`
전체 교육생 목록 반환 (no 오름차순).

### `PATCH /api/trainees`
개별 교육생 정보 수정. Body:
```json
{
  "no": 1,
  "name": "구윤모",
  "dept": "서울특별시 데이터센터 인터넷통신과",
  "type": "광역지자체",
  "modified": true,
  "done": true,
  "reason": "부서명 변경"
}
```

## 권한 모델
**자유 수정 (인증 없음).** 링크를 아는 사람은 누구나 모든 행을 수정 가능.
18명 내부 교육 용도라 신뢰 기반으로 운영. 링크 외부 공개에 주의.

## 데이터 확인
운영자는 [Neon Console SQL Editor](https://console.neon.tech) 에서 직접 조회:
```sql
SELECT no, name, dept, type, modified, done, reason, updated_at
FROM trainees
ORDER BY no;
```

CSV로 내보내려면 Neon SQL Editor 결과 화면 우측의 **Export → CSV** 사용.
