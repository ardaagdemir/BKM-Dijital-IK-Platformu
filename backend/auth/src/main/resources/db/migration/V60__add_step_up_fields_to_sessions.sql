-- US-08D.1.4 (FR-1116): Bordro modülüne girişte ek doğrulama adımı (basit
-- 2FA) — "Bordro ekranına girişte ikinci faktör istenir." Bu, roadmap'in
-- kendi notuyla (US-09.1.3) BİLİNÇLİ OLARAK BASİT bir uygulama: kurumsal
-- LDAP+MFA/TOTP entegrasyonu Bölüm 9.1'e ertelenmiştir; burada e-posta ile
-- gönderilen tek kullanımlık bir kod yeterli.
--
-- Üç sütun da NULLABLE — mevcut oturumlar (bu migration'dan önce açılmış)
-- doğal olarak "step-up doğrulanmamış" sayılır (step_up_verified_at NULL),
-- bu da GÜVENLİ bir varsayılan: var olan bir oturum otomatik olarak bordro
-- erişim hakkı KAZANMAZ, tekrar doğrulama istenir.

ALTER TABLE sessions ADD COLUMN step_up_code VARCHAR(10);
ALTER TABLE sessions ADD COLUMN step_up_code_expires_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE sessions ADD COLUMN step_up_verified_at TIMESTAMP WITH TIME ZONE;
