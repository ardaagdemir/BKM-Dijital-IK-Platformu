-- US-08F.1.2: Talebin durumunu güncelleme (Değerlendirmede/Onaylandı/
-- Tamamlandı) — `travel.expense_items`'daki (V42→V43) AYNI ALTER+DROP
-- DEFAULT deseni. Var olan (US-08F.1.1'de oluşturulmuş) kayıtlar
-- varsayılan PENDING ("Değerlendirmede") olarak geriye dönük dolduruluyor.

ALTER TABLE suggestions
    ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'PENDING';

ALTER TABLE suggestions
    ALTER COLUMN status DROP DEFAULT;
