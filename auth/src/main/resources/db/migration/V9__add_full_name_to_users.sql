-- US-02.2.4: Profilde gösterilecek "ad" alanı.

ALTER TABLE users ADD COLUMN full_name VARCHAR(255);

UPDATE users SET full_name = 'Sistem Yöneticisi' WHERE email = 'admin@dijitalik.local';
