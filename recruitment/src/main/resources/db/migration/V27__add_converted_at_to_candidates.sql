-- US-05.4.2: Adayın bir çalışan kaydına "dönüştürüldüğü" an. Bu, ORGANIZATION
-- MODÜLÜNDE GERÇEK BİR ÇALIŞAN KAYDI OLUŞTURMAZ (recruitment organization'a
-- bağımlı değil) — yalnızca adayın işlendiğini işaretler; asıl POST
-- /api/organization/employees çağrısı İK kullanıcısı tarafından, bu uçtan
-- dönen taslak bilgilerle, AYRI ve MANUEL olarak yapılır (kabul kriteri:
-- "manuel tetiklemeli, tam otomatik senkron değil").

ALTER TABLE candidates
    ADD COLUMN converted_at TIMESTAMP WITH TIME ZONE;
