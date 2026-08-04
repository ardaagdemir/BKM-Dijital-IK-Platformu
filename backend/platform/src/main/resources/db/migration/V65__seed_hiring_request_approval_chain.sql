-- US-09.2.1: "hiring-request" onay zinciri — recruitment.HiringRequest'in
-- MEVCUT iki aşamalı (yönetici → İK) akışını (bkz. HiringRequestStatus:
-- PENDING → MANAGER_APPROVED → APPROVED) birebir yeniden üreten seed veri.
INSERT INTO approval_chain_definitions (name, created_at, updated_at, created_by, updated_by)
VALUES ('hiring-request', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system', 'system');

INSERT INTO approval_chain_step_definitions (chain_definition_id, step_order, required_role, created_at, updated_at, created_by, updated_by)
SELECT id, 1, 'YONETICI', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system', 'system' FROM approval_chain_definitions WHERE name = 'hiring-request';

INSERT INTO approval_chain_step_definitions (chain_definition_id, step_order, required_role, created_at, updated_at, created_by, updated_by)
SELECT id, 2, 'IK', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system', 'system' FROM approval_chain_definitions WHERE name = 'hiring-request';
