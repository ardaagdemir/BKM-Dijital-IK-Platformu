-- US-02.2.2: Bootstrap admin kullanıcısına (V3) ADMIN rolünü (V6) ata.

INSERT INTO user_roles (user_id, role_id, created_at, updated_at, created_by, updated_by)
SELECT u.id, r.id, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system', 'system'
FROM users u, roles r
WHERE u.email = 'admin@dijitalik.local' AND r.code = 'ADMIN';
