-- US-08B.1.3: Masraf kalemi onayı — leave.LeaveRequest/training.TrainingEnrollment'teki
-- (V19/V39) AYNI "talep→onay" deseninin tekrar kullanımı. Var olan (US-08B.1.2'de
-- oluşturulmuş) kayıtlar için varsayılan PENDING olarak geriye dönük dolduruluyor
-- (bkz. recruitment.candidates 'stage' kolonundaki, V24'teki aynı desen).

ALTER TABLE expense_items
    ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    ADD COLUMN rejection_reason VARCHAR(1000);

ALTER TABLE expense_items
    ALTER COLUMN status DROP DEFAULT;
