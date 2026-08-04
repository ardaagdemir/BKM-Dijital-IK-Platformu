package com.digitalik.performance.entity;

import com.digitalik.core.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

/**
 * US-06.2.2: Bir yöneticinin, bağlı bir çalışan için yaptığı değerlendirme —
 * {@link SelfAssessment}'teki (US-06.2.1) AYNI şekil ama BİLİNÇLİ OLARAK
 * AYRI bir entity; bkz. V31 migration'ındaki gerekçe.
 *
 * <p>{@code employeeId}, {@code organization.Employee}'ye DB seviyesinde bir
 * FK İLE değil düz bir {@code Long} olarak tutulur — bkz. {@code SelfAssessment}'teki
 * aynı gerekçe.
 *
 * <p>{@code period} (US-06.3.1, V33): serbest metin dönem etiketi (ör.
 * "2026-Q1") — geçmiş sonuçların dönem bazlı listelenebilmesi için.
 */
@Entity
@Table(name = "manager_assessments")
public class ManagerAssessment extends BaseEntity {

    @Column(nullable = false)
    private Long employeeId;

    @Column(nullable = false)
    private String period;

    protected ManagerAssessment() {
        // JPA için
    }

    public ManagerAssessment(Long employeeId, String period) {
        this.employeeId = employeeId;
        this.period = period;
    }

    public Long getEmployeeId() {
        return employeeId;
    }

    public String getPeriod() {
        return period;
    }
}
