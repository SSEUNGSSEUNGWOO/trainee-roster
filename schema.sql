-- 23-1기 교육생 명단 테이블
CREATE TABLE IF NOT EXISTS trainees (
  no INT PRIMARY KEY,
  ki TEXT NOT NULL,
  name TEXT NOT NULL,
  dept TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('중앙부처', '공공기관', '광역지자체', '기초지자체')),
  orig_name TEXT,
  orig_dept TEXT,
  orig_type TEXT,
  modified BOOLEAN NOT NULL DEFAULT FALSE,
  done BOOLEAN NOT NULL DEFAULT FALSE,
  reason TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 이미 생성된 DB용 마이그레이션 (멱등)
ALTER TABLE trainees ADD COLUMN IF NOT EXISTS orig_name TEXT;
ALTER TABLE trainees ADD COLUMN IF NOT EXISTS orig_dept TEXT;
ALTER TABLE trainees ADD COLUMN IF NOT EXISTS orig_type TEXT;

-- orig_* 가 비어있으면 현재 값으로 백필 (시드 직후 한 번만 의미 있음)
UPDATE trainees SET
  orig_name = name,
  orig_dept = dept,
  orig_type = type
WHERE orig_name IS NULL OR orig_dept IS NULL OR orig_type IS NULL;

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
