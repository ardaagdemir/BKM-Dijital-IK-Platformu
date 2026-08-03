-- US-08A.1.3: "Tamamlanan eğitimleri çalışan bazında görmek" için, onaylanmış
-- bir talebin GERÇEKTEN tamamlandığı tarih. NULLABLE — yalnızca COMPLETED
-- durumundaki kayıtlarda doludur; PENDING/APPROVED/REJECTED için anlamsız
-- olduğundan varsayılan bir değer atanmadı (V33/V37'deki "geriye dönük
-- doldurma" deseninin AKSİNE, çünkü burada "bilinmiyor" değil "henüz yok"
-- doğru anlam).

ALTER TABLE training_enrollments
    ADD COLUMN completed_date DATE;
