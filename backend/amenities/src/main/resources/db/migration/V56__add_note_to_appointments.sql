-- US-08H.1.3 (SEC-020): Randevu notu — sağlık/kişisel veri içerebilir,
-- yalnızca yetkili roller (ADMIN/IK) görebilmeli. Var olan (US-08H.1.2'de
-- oluşturulmuş) randevular için NULL — henüz not eklenmemiş.

ALTER TABLE appointments ADD COLUMN note VARCHAR(2000);
