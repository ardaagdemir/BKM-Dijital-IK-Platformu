-- US-06.3.1: "Dönem bazlı liste görüntülenir" — geçmiş sonuçların
-- gruplanabileceği bir dönem etiketi (ör. "2026-Q1", "2026"). Serbest
-- metin: FR-306'daki "yıllık, dönem bazlı, aylık" esnekliğine uyum için
-- format servis seviyesinde ZORUNLU KILINMADI, yalnızca boş olamaz.
--
-- Var olan (US-06.2.2'de oluşturulmuş) kayıtlar için varsayılan
-- 'BILINMIYOR' olarak geriye dönük dolduruluyor (bkz. recruitment.candidates
-- 'stage' kolonundaki, V24'teki aynı desen).

ALTER TABLE manager_assessments
    ADD COLUMN period VARCHAR(50) NOT NULL DEFAULT 'BILINMIYOR';

ALTER TABLE manager_assessments
    ALTER COLUMN period DROP DEFAULT;
