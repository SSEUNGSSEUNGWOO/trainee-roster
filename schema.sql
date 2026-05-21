-- 23-1기 교육생 명단 테이블
CREATE TABLE IF NOT EXISTS trainees (
  no INT PRIMARY KEY,
  ki TEXT NOT NULL,
  name TEXT NOT NULL,
  dept TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('중앙부처', '공공기관', '광역지자체', '기초지자체')),
  modified BOOLEAN NOT NULL DEFAULT FALSE,
  done BOOLEAN NOT NULL DEFAULT FALSE,
  reason TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

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
