-- user_roles 테이블의 granted_by 컬럼을 nullable로 변경
ALTER TABLE user_roles ALTER COLUMN granted_by DROP NOT NULL;

-- 기존 데이터에 기본값 설정 (있다면)
UPDATE user_roles SET granted_by = 'system' WHERE granted_by IS NULL;

-- granted_by 컬럼에 기본값 설정
ALTER TABLE user_roles ALTER COLUMN granted_by SET DEFAULT 'system';

-- 코멘트 업데이트
COMMENT ON COLUMN user_roles.granted_by IS '역할 부여자 (nullable, 기본값: system)';
