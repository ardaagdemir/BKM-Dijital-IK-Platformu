package com.digitalik.recruitment.entity;

import com.digitalik.core.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;

/**
 * US-05.3.1: Bir organizasyon birimi + unvan için işe alım talebi —
 * yalnızca o (birim, unvan) çifti için bir {@link StaffingNorm} tanımlıysa
 * oluşturulabilir (bkz. {@code HiringRequestService.create}); {@code PENDING}
 * durumuyla kaydedilir.
 *
 * <p>US-05.3.2: İKİ aşamalı onay — {@link #approveByManager()}/{@link #rejectByManager()}
 * (yalnızca {@code PENDING} iken), sonra {@link #approveByHr()}/{@link #rejectByHr()}
 * (yalnızca {@code MANAGER_APPROVED} iken). Bu, {@code leave.LeaveRequest}/US-04.2.2'deki
 * TEK aşamalı onaydan BİLİNÇLİ OLARAK farklı bir uygulama — roadmap Bölüm
 * 5.3'ün notu ("İşe Alım'daki onay adımı, İzin'dekiyle AYNI KOD DEĞİL, benzer
 * desende ayrı bir uygulama") gereği hiçbir kod paylaşılmadı, yalnızca desen
 * (durum makinesi + rol bazlı yetkilendirme) tekrarlandı. Ret gerekçesi
 * kasıtlı olarak yok — kabul kriteri (US-04.2.2'nin aksine) bunu istemiyor.
 *
 * <p>{@code organizationUnitId}/{@code jobTitleId}, {@code organization}'a
 * DB seviyesinde bir FK İLE değil düz birer {@code Long} olarak tutulur —
 * {@code recruitment} modülü {@code organization}'a bağımlı değildir; bkz.
 * V22 migration'ındaki ({@code staffing_norms}) aynı gerekçe.
 */
@Entity
@Table(name = "hiring_requests")
public class HiringRequest extends BaseEntity {

    @Column(nullable = false)
    private Long organizationUnitId;

    @Column(nullable = false)
    private Long jobTitleId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private HiringRequestStatus status;

    protected HiringRequest() {
        // JPA için
    }

    public HiringRequest(Long organizationUnitId, Long jobTitleId) {
        this.organizationUnitId = organizationUnitId;
        this.jobTitleId = jobTitleId;
        this.status = HiringRequestStatus.PENDING;
    }

    public void approveByManager() {
        this.status = HiringRequestStatus.MANAGER_APPROVED;
    }

    public void rejectByManager() {
        this.status = HiringRequestStatus.REJECTED;
    }

    public void approveByHr() {
        this.status = HiringRequestStatus.APPROVED;
    }

    public void rejectByHr() {
        this.status = HiringRequestStatus.REJECTED;
    }

    public Long getOrganizationUnitId() {
        return organizationUnitId;
    }

    public Long getJobTitleId() {
        return jobTitleId;
    }

    public HiringRequestStatus getStatus() {
        return status;
    }
}
