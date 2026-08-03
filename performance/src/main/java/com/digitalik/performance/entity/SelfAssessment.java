package com.digitalik.performance.entity;

import com.digitalik.core.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

/**
 * US-06.2.1: Bir çalışanın öz değerlendirmesi — tanımlı hedef/yetkinlik seti
 * üzerinden kendi kendine verdiği puanların (bkz. {@link SelfAssessmentScore})
 * üst kaydı. Bir çalışanın birden fazla öz değerlendirmesi olabilir (dönemsel
 * değerlendirme döngüleri) — tekillik kısıtı yok.
 *
 * <p>{@code employeeId}, {@code organization.Employee}'ye DB seviyesinde bir
 * FK İLE değil düz bir {@code Long} olarak tutulur — {@code performance}
 * modülü {@code organization}'a bağımlı değildir; bkz. V30 migration'ındaki
 * ayrıntılı not.
 */
@Entity
@Table(name = "self_assessments")
public class SelfAssessment extends BaseEntity {

    @Column(nullable = false)
    private Long employeeId;

    protected SelfAssessment() {
        // JPA için
    }

    public SelfAssessment(Long employeeId) {
        this.employeeId = employeeId;
    }

    public Long getEmployeeId() {
        return employeeId;
    }
}
