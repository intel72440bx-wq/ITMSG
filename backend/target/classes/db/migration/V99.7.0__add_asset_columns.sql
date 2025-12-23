-- 자산 테이블에 새로운 컬럼들 추가

-- 자산명 추가 (필수)
ALTER TABLE assets ADD COLUMN IF NOT EXISTS name VARCHAR(100) NOT NULL DEFAULT '';

-- 모델명 추가
ALTER TABLE assets ADD COLUMN IF NOT EXISTS model VARCHAR(100);

-- 제조사 추가
ALTER TABLE assets ADD COLUMN IF NOT EXISTS manufacturer VARCHAR(100);

-- 위치 추가
ALTER TABLE assets ADD COLUMN IF NOT EXISTS location VARCHAR(100);

-- 보증 만료일 추가
ALTER TABLE assets ADD COLUMN IF NOT EXISTS warranty_end_date DATE;

-- 상태 추가 (기본값: AVAILABLE)
ALTER TABLE assets ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE';

-- 비고 추가
ALTER TABLE assets ADD COLUMN IF NOT EXISTS notes VARCHAR(500);

-- created_by, updated_at, updated_by 컬럼들 추가 (BaseEntity를 상속받기 때문에 필요)
ALTER TABLE assets ADD COLUMN IF NOT EXISTS created_by VARCHAR(50);
ALTER TABLE assets ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE assets ADD COLUMN IF NOT EXISTS updated_by VARCHAR(50);
ALTER TABLE assets ADD COLUMN IF NOT EXISTS version BIGINT DEFAULT 0;

-- 기존 데이터에 기본값 설정 (name 필수이므로 기존 데이터에 기본값 설정)
UPDATE assets SET name = asset_number WHERE name = '';

-- 인덱스 추가 (선택사항)
CREATE INDEX IF NOT EXISTS idx_asset_name ON assets(name);
CREATE INDEX IF NOT EXISTS idx_asset_status ON assets(status);
CREATE INDEX IF NOT EXISTS idx_asset_type ON assets(asset_type);
