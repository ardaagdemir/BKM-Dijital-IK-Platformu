-- US-09.7.1: expense_items artık belgeyi kendi inline VARBINARY sütununda değil,
-- platform.file.FileStorageService'in ürettiği stored_files kaydına bir referansla
-- tutuyor — genel dosya saklama servisinin ilk somut taşıma örneği (bkz. o
-- servisin javadoc'u). Projede henüz gerçek üretim verisi olmadığından var olan
-- satırlar (varsa) migre edilmedi, eski sütunlar basitçe kaldırıldı.
ALTER TABLE expense_items ADD COLUMN stored_file_id BIGINT NOT NULL REFERENCES stored_files(id);
ALTER TABLE expense_items DROP COLUMN document_file_name;
ALTER TABLE expense_items DROP COLUMN document_content_type;
ALTER TABLE expense_items DROP COLUMN document_data;
