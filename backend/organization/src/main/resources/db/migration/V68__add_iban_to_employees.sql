-- US-09.8.1: Banka ödeme dosyası üretimi için çalışanın IBAN'ı. Nullable —
-- işe girişte henüz bilinmeyebilir, ayrı bir uçla (PUT .../iban) sonradan
-- girilir. US-09.9.1'deki AYNI gerekçeyle VARCHAR(255): şifreli (Base64:
-- IV+ciphertext+GCM tag) değer ham IBAN'dan (26 karakter) çok daha uzun.
ALTER TABLE employees ADD COLUMN iban VARCHAR(255);
