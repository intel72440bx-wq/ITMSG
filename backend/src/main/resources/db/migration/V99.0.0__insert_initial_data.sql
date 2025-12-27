-- 초기 데이터 삽입

-- 기본 회사 데이터
INSERT INTO companies (code, name, business_number, ceo_name, created_by, updated_by) VALUES
('COMP001', 'ITMSG 본사', '123-45-67890', '홍길동', 'system', 'system');

-- 기본 부서 데이터
INSERT INTO departments (company_id, name, depth, sort_order, created_by, updated_by) VALUES
((SELECT id FROM companies WHERE code = 'COMP001'), 'IT본부', 0, 1, 'system', 'system'),
((SELECT id FROM companies WHERE code = 'COMP001'), '개발팀', 1, 1, 'system', 'system'),
((SELECT id FROM companies WHERE code = 'COMP001'), '운영팀', 1, 2, 'system', 'system');

-- 개발팀의 parent_id 설정
UPDATE departments 
SET parent_id = (SELECT id FROM departments WHERE name = 'IT본부' AND depth = 0 LIMIT 1)
WHERE name IN ('개발팀', '운영팀') AND depth = 1;

-- 관리자 계정 생성 (비밀번호: admin1234)
-- BCrypt 해시: $2a$10$RSih82WGdPGHLKwNmBKFAeIEc69TebIajf97uZh8Ziq0X05V1SRqa
INSERT INTO users (email, password, name, company_id, is_active, is_approved, created_by, updated_by) VALUES
('admin@itmsg.com', '$2a$10$RSih82WGdPGHLKwNmBKFAeIEc69TebIajf97uZh8Ziq0X05V1SRqa', '시스템 관리자', 
 (SELECT id FROM companies WHERE code = 'COMP001'), true, true, 'system', 'system');

-- 관리자에게 ADMIN 역할 부여
INSERT INTO user_roles (user_id, role_id, granted_by) VALUES
((SELECT id FROM users WHERE email = 'admin@itmsg.com'),
 (SELECT id FROM roles WHERE name = 'ROLE_ADMIN'),
 'system');

-- 기본 메뉴 데이터
INSERT INTO menus (name, path, depth, sort_order, icon, is_visible, created_by, updated_by) VALUES
('시스템 관리', '/system', 0, 1, 'settings', true, 'system', 'system'),
('사용자 관리', '/system/users', 1, 1, 'people', true, 'system', 'system'),
('권한 관리', '/system/roles', 1, 2, 'security', true, 'system', 'system'),
('회사 관리', '/system/companies', 1, 3, 'business', true, 'system', 'system'),
('IT 관리', '/it', 0, 2, 'computer', true, 'system', 'system'),
('프로젝트 관리', '/it/projects', 1, 1, 'folder', true, 'system', 'system');

-- 시스템 관리 메뉴의 parent_id 설정
UPDATE menus 
SET parent_id = (SELECT id FROM menus WHERE name = '시스템 관리' AND depth = 0 LIMIT 1)
WHERE name IN ('사용자 관리', '권한 관리', '회사 관리') AND depth = 1;

UPDATE menus 
SET parent_id = (SELECT id FROM menus WHERE name = 'IT 관리' AND depth = 0 LIMIT 1)
WHERE name = '프로젝트 관리' AND depth = 1;

-- ADMIN 역할에 모든 메뉴 권한 부여
INSERT INTO menu_permissions (menu_id, role_id, can_read, can_create, can_update, can_delete, created_by)
SELECT m.id, r.id, true, true, true, true, 'system'
FROM menus m, roles r
WHERE r.name = 'ROLE_ADMIN';

-- 샘플 파트너 데이터
INSERT INTO partners (code, name, business_number, ceo_name, created_by, updated_by) VALUES
('PART001', '(주)테크노솔루션', '111-22-33333', '김철수', 'system', 'system'),
('PART002', '(주)디지털인사이트', '444-55-66666', '박영희', 'system', 'system'),
('PART003', '(주)스마트시스템', '777-88-99999', '이민수', 'system', 'system');

-- 샘플 PM 사용자 데이터
INSERT INTO users (email, password, name, company_id, is_active, is_approved, created_by, updated_by) VALUES
('pm1@techno.com', '$2a$10$RSih82WGdPGHLKwNmBKFAeIEc69TebIajf97uZh8Ziq0X05V1SRqa', '테크노 김PM', (SELECT id FROM companies WHERE code = 'COMP001'), true, true, 'system', 'system'),
('pm2@techno.com', '$2a$10$RSih82WGdPGHLKwNmBKFAeIEc69TebIajf97uZh8Ziq0X05V1SRqa', '테크노 박PM', (SELECT id FROM companies WHERE code = 'COMP001'), true, true, 'system', 'system'),
('pm1@digital.com', '$2a$10$RSih82WGdPGHLKwNmBKFAeIEc69TebIajf97uZh8Ziq0X05V1SRqa', '디지털 최PM', (SELECT id FROM companies WHERE code = 'COMP001'), true, true, 'system', 'system'),
('pm1@smart.com', '$2a$10$RSih82WGdPGHLKwNmBKFAeIEc69TebIajf97uZh8Ziq0X05V1SRqa', '스마트 정PM', (SELECT id FROM companies WHERE code = 'COMP001'), true, true, 'system', 'system'),
('pm2@smart.com', '$2a$10$RSih82WGdPGHLKwNmBKFAeIEc69TebIajf97uZh8Ziq0X05V1SRqa', '스마트 한PM', (SELECT id FROM companies WHERE code = 'COMP001'), true, true, 'system', 'system');

-- 파트너별 PM 관계 설정
INSERT INTO partner_pms (partner_id, user_id) VALUES
-- 테크노솔루션의 PM들
((SELECT id FROM partners WHERE code = 'PART001'), (SELECT id FROM users WHERE email = 'pm1@techno.com')),
((SELECT id FROM partners WHERE code = 'PART001'), (SELECT id FROM users WHERE email = 'pm2@techno.com')),
-- 디지털인사이트의 PM들
((SELECT id FROM partners WHERE code = 'PART002'), (SELECT id FROM users WHERE email = 'pm1@digital.com')),
-- 스마트시스템의 PM들
((SELECT id FROM partners WHERE code = 'PART003'), (SELECT id FROM users WHERE email = 'pm1@smart.com')),
((SELECT id FROM partners WHERE code = 'PART003'), (SELECT id FROM users WHERE email = 'pm2@smart.com'));

-- PM 사용자들에게 PM 역할 부여
INSERT INTO user_roles (user_id, role_id, granted_by) VALUES
((SELECT id FROM users WHERE email = 'pm1@techno.com'), (SELECT id FROM roles WHERE name = 'ROLE_PM'), 'system'),
((SELECT id FROM users WHERE email = 'pm2@techno.com'), (SELECT id FROM roles WHERE name = 'ROLE_PM'), 'system'),
((SELECT id FROM users WHERE email = 'pm1@digital.com'), (SELECT id FROM roles WHERE name = 'ROLE_PM'), 'system'),
((SELECT id FROM users WHERE email = 'pm1@smart.com'), (SELECT id FROM roles WHERE name = 'ROLE_PM'), 'system'),
((SELECT id FROM users WHERE email = 'pm2@smart.com'), (SELECT id FROM roles WHERE name = 'ROLE_PM'), 'system');
