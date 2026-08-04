package com.digitalik.recruitment.entity;

/**
 * US-05.3.1/US-05.3.2: İşe alım talebinin durumu. İki aşamalı onay zinciri
 * (yönetici → İK — kabul kriteri): {@code PENDING} → (yönetici onayı) →
 * {@code MANAGER_APPROVED} → (İK onayı) → {@code APPROVED}. {@code REJECTED},
 * her iki aşamada da (yönetici VEYA İK) gerçekleşebilir.
 */
public enum HiringRequestStatus {
    PENDING,
    MANAGER_APPROVED,
    APPROVED,
    REJECTED
}
