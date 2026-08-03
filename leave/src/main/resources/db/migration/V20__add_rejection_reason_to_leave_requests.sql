-- US-04.2.2: Ret gerekçesi (yalnızca REJECTED durumunda doldurulur; kabul
-- kriteri gereği ret işleminde zorunlu, servis seviyesinde doğrulanır).

ALTER TABLE leave_requests
    ADD COLUMN rejection_reason VARCHAR(1000);
