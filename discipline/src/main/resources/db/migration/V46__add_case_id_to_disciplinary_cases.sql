-- US-08C.1.3 (SEC-021): Disiplin modülünde geçmiş kayıtlar değiştirilemez,
-- yalnızca revizyon eklenebilir. Var olan bir revizyon satırı bundan sonra
-- ARTIK ASLA UPDATE görmez; her değişiklik (savunma kaydı, kapatma) önceki
-- durumu miras alan YENİ bir satır olarak eklenir (bkz. DisciplinaryCase
-- entity javadoc'u).
--
-- case_id NULL: bu satır sürecin İLK (kök) revizyonudur — kendi id'si aynı
-- zamanda dışarıya gösterilen, sürecin ömrü boyunca DEĞİŞMEYEN "süreç
-- id"sidir.
-- case_id DOLU: bu satır, işaret ettiği id'li kök revizyonun SONRAKİ bir
-- revizyonudur. Kök revizyona FK ile bağlıdır (her zaman ÖNCEDEN var olan
-- bir satırı işaret eder, kendisini veya sonraki bir satırı değil).

ALTER TABLE disciplinary_cases ADD COLUMN case_id BIGINT REFERENCES disciplinary_cases (id);

CREATE INDEX idx_disciplinary_cases_case_id ON disciplinary_cases (case_id);
