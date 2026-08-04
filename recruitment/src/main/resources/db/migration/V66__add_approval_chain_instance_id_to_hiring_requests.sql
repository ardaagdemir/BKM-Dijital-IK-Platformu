-- US-09.2.1: hiring_requests artık kendi durum geçişini (PENDING →
-- MANAGER_APPROVED → APPROVED/REJECTED) platform.approval.ApprovalChainService
-- (bkz. seed edilen "hiring-request" zinciri, V65) ile PARALEL olarak
-- takip ediyor — status kolonu/anlamı DEĞİŞMEDİ, yalnızca hangi zincir
-- örneğinin bu talebe ait olduğunu tutan yeni bir sütun eklendi.
ALTER TABLE hiring_requests ADD COLUMN approval_chain_instance_id BIGINT NOT NULL REFERENCES approval_chain_instances(id);
