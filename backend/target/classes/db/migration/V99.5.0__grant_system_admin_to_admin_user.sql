-- admin@itmsg.com 사용자에게 SYSTEM_ADMIN 역할 부여

-- admin@itmsg.com 사용자에게 SYSTEM_ADMIN 역할 부여 (없는 경우에만)
INSERT INTO user_roles (user_id, role_id, granted_by)
SELECT
    u.id,
    r.id,
    'system'
FROM users u, roles r
WHERE u.email = 'admin@itmsg.com'
  AND r.name = 'ROLE_SYSTEM_ADMIN'
  AND NOT EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = u.id AND ur.role_id = r.id
  );
