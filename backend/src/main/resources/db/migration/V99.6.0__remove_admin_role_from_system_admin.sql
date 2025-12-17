-- admin@itmsg.com 사용자에게서 ROLE_ADMIN 권한 제거 (SYSTEM_ADMIN만 남김)

-- admin@itmsg.com 사용자와 ROLE_ADMIN 역할 간의 관계 삭제
DELETE FROM user_roles
WHERE user_id = (SELECT id FROM users WHERE email = 'admin@itmsg.com')
  AND role_id = (SELECT id FROM roles WHERE name = 'ROLE_ADMIN');
