-- AI 챔피언 참여자 명단 테이블
CREATE TABLE IF NOT EXISTS trainees (
  no INT PRIMARY KEY,
  cohort TEXT NOT NULL,
  name TEXT NOT NULL,
  org_type TEXT NOT NULL CHECK (org_type IN ('중앙부처', '공공기관', '광역지자체', '기초지자체')),
  org TEXT NOT NULL,
  dept TEXT NOT NULL DEFAULT '',
  rank TEXT NOT NULL DEFAULT '',
  orig_name TEXT,
  orig_org_type TEXT,
  orig_org TEXT,
  orig_dept TEXT,
  orig_rank TEXT,
  modified BOOLEAN NOT NULL DEFAULT FALSE,
  done BOOLEAN NOT NULL DEFAULT FALSE,
  reason TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 이미 생성된 DB용 마이그레이션 (멱등)
ALTER TABLE trainees ADD COLUMN IF NOT EXISTS cohort TEXT;
ALTER TABLE trainees ADD COLUMN IF NOT EXISTS org_type TEXT;
ALTER TABLE trainees ADD COLUMN IF NOT EXISTS org TEXT;
ALTER TABLE trainees ADD COLUMN IF NOT EXISTS rank TEXT NOT NULL DEFAULT '';
ALTER TABLE trainees ADD COLUMN IF NOT EXISTS orig_name TEXT;
ALTER TABLE trainees ADD COLUMN IF NOT EXISTS orig_org_type TEXT;
ALTER TABLE trainees ADD COLUMN IF NOT EXISTS orig_org TEXT;
ALTER TABLE trainees ADD COLUMN IF NOT EXISTS orig_dept TEXT;
ALTER TABLE trainees ADD COLUMN IF NOT EXISTS orig_rank TEXT;
ALTER TABLE trainees DROP COLUMN IF EXISTS ki;
ALTER TABLE trainees DROP COLUMN IF EXISTS type;
ALTER TABLE trainees DROP COLUMN IF EXISTS orig_type;

-- orig_* 가 비어있으면 현재 값으로 백필 (시드 직후 한 번만 의미 있음)
UPDATE trainees SET
  orig_name = name,
  orig_org_type = org_type,
  orig_org = org,
  orig_dept = dept,
  orig_rank = rank
WHERE orig_name IS NULL
   OR orig_org_type IS NULL
   OR orig_org IS NULL
   OR orig_dept IS NULL
   OR orig_rank IS NULL;

-- updated_at 자동 갱신 트리거
CREATE OR REPLACE FUNCTION touch_updated_at() RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trainees_touch ON trainees;
CREATE TRIGGER trainees_touch
BEFORE UPDATE ON trainees
FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
