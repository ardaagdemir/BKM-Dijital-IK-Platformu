-- US-09.9.1: national_id ve amount artık core.security.EncryptedStringConverter/
-- EncryptedBigDecimalConverter ile AES-GCM şifrelenmiş metin olarak saklanıyor —
-- şifreli (Base64) değer, ham TC No/tutardan çok daha uzun olduğundan sütunlar
-- genişletiliyor. Projede henüz gerçek üretim verisi olmadığından (yalnızca
-- seed/test verisi) basit bir tip değişikliği yeterli — var olan satırlar
-- (varsa) düz metin olarak kalır, bir sonraki güncellemede otomatik şifrelenir.
ALTER TABLE employees ALTER COLUMN national_id TYPE VARCHAR(255);
ALTER TABLE employee_salary_records ALTER COLUMN amount TYPE VARCHAR(255) USING amount::text;
