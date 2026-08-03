-- US-02.1.1: Yerel geliştirme için tek bir bootstrap kullanıcısı.
-- Henüz bir "kullanıcı oluştur" ekranı/story'si olmadığından (bkz. roadmap Bölüm 2),
-- giriş akışını test edebilmek için buraya seed data olarak ekleniyor.
--
-- E-posta: admin@dijitalik.local
-- Parola : ChangeMe123!  (yalnızca yerel/geliştirme ortamı içindir)

INSERT INTO users (email, password_hash, created_at, updated_at, created_by, updated_by)
VALUES (
    'admin@dijitalik.local',
    '$2a$10$Za8hMpnR6.0HqzcWXI.eNutIb0G4Nps4Wfkaod8aN737Tjyv2Po8K',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    'system',
    'system'
);
