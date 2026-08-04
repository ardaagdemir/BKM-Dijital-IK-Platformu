-- US-03.2.2: Çalışanın güncel organizasyon birimi + unvan ataması.
-- Yalnızca GÜNCEL atamayı tutar; geçmiş izleme US-03.4.1'de ayrıca ele alınacak.

ALTER TABLE employees
    ADD COLUMN organization_unit_id BIGINT REFERENCES organization_units(id),
    ADD COLUMN job_title_id         BIGINT REFERENCES job_titles(id);
