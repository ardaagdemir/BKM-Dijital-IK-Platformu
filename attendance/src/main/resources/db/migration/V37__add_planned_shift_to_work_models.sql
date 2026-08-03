-- US-07.2.2: "Planlanan vardiya ile fiili giriş-çıkışı karşılaştırma" için
-- çalışma modeline planlanan başlangıç/bitiş saati eklendi — US-07.1.1'de
-- BİLİNÇLİ OLARAK eklenmemişti (o story yalnızca modelin TANIMLANMASINI
-- kapsıyordu), bu story bu veriye GERÇEKTEN ihtiyaç duyuyor.
--
-- Var olan kayıtlar (US-07.1.1'de oluşturulmuş) için tipik mesai saatleri
-- (09:00-18:00) varsayılan olarak geriye dönük dolduruluyor (bkz.
-- recruitment.candidates 'stage' kolonundaki, V24'teki AYNI desen).

ALTER TABLE work_models
    ADD COLUMN planned_start_time TIME NOT NULL DEFAULT '09:00:00',
    ADD COLUMN planned_end_time TIME NOT NULL DEFAULT '18:00:00';

ALTER TABLE work_models
    ALTER COLUMN planned_start_time DROP DEFAULT;

ALTER TABLE work_models
    ALTER COLUMN planned_end_time DROP DEFAULT;
