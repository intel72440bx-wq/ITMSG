-- 파트너 테이블에 PM(Project Manager) 컬럼 추가
ALTER TABLE partners ADD COLUMN pm_id BIGINT;

-- 외래 키 제약조건 추가
ALTER TABLE partners ADD CONSTRAINT fk_partners_pm_id
    FOREIGN KEY (pm_id) REFERENCES users(id);

-- 인덱스 추가
CREATE INDEX idx_partners_pm_id ON partners(pm_id);
