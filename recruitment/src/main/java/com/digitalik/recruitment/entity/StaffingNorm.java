package com.digitalik.recruitment.entity;

import com.digitalik.core.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

/**
 * US-05.1.1: Bir organizasyon birimi + unvan için tanımlanan norm kadro
 * sayısı — "birim/unvan bazlı norm kadro sayısı" (kabul kriteri). Bir
 * (birim, unvan) çiftinin en fazla bir norm kaydı olur; {@link #updateNorm}
 * ile mevcut kayıt güncellenir (upsert — bkz. {@code StaffingNormService}).
 *
 * <p>{@code organizationUnitId}/{@code jobTitleId}, {@code organization.OrganizationUnit}/
 * {@code JobTitle}'a DB seviyesinde bir FK İLE değil düz birer {@code Long}
 * olarak tutulur — {@code recruitment} modülü {@code organization}'a bağımlı
 * değildir (yalnızca core'a bağımlı mimari kuralı); bkz. V22 migration'ındaki
 * ayrıntılı not. Bu, sunucu tarafında birim/unvanın GERÇEKTEN var olup
 * olmadığını doğrulayamama bedeliyle gelir — {@code leave.LeaveRequest.employeeId}'deki
 * aynı, kabul edilmiş kısıt.
 */
@Entity
@Table(
        name = "staffing_norms",
        uniqueConstraints = @UniqueConstraint(columnNames = {"organization_unit_id", "job_title_id"}))
public class StaffingNorm extends BaseEntity {

    @Column(nullable = false)
    private Long organizationUnitId;

    @Column(nullable = false)
    private Long jobTitleId;

    @Column(nullable = false)
    private Integer normCount;

    protected StaffingNorm() {
        // JPA için
    }

    public StaffingNorm(Long organizationUnitId, Long jobTitleId, Integer normCount) {
        this.organizationUnitId = organizationUnitId;
        this.jobTitleId = jobTitleId;
        this.normCount = normCount;
    }

    public void updateNorm(Integer normCount) {
        this.normCount = normCount;
    }

    public Long getOrganizationUnitId() {
        return organizationUnitId;
    }

    public Long getJobTitleId() {
        return jobTitleId;
    }

    public Integer getNormCount() {
        return normCount;
    }
}
