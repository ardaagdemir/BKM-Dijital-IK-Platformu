package com.digitalik.core.entity;

/**
 * US-01.3.1 kapsamındaki audit_log kayıtlarının işlem tipi. Yalnızca
 * oluşturma/güncelleme izlenir; silme işlemi şu an hiçbir varlıkta
 * desteklenmediği için kapsam dışıdır (bkz. FR-407: kayıtlar silinmez).
 */
public enum AuditOperation {
    CREATE,
    UPDATE
}
