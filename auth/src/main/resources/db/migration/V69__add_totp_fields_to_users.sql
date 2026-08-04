-- US-09.1.3: TOTP tabanlı MFA — mevcut e-posta step-up akışına (V60) EK bir
-- ALTERNATİF doğrulama yolu, onun yerine geçmiyor. Sır (totp_secret) Session'da
-- DEĞİL burada: oturum logout'ta silinir, ama TOTP kaydı KALICI olmalı.
-- totp_enabled, "kayıt başlatıldı ama henüz ilk kodla doğrulanmadı" ile
-- "gerçekten aktif" durumlarını ayırt eder (bkz. User.enrollTotp/confirmTotp).
ALTER TABLE users ADD COLUMN totp_secret VARCHAR(64);
ALTER TABLE users ADD COLUMN totp_enabled BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE users ADD COLUMN totp_enrolled_at TIMESTAMP WITH TIME ZONE;
