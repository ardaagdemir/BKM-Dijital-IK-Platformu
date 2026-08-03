package com.digitalik.attendance.entity;

import com.digitalik.core.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

/**
 * US-07.1.2: Bir çalışana atanmış çalışma modeli — {@code employeeId},
 * {@code organization.Employee}'ye DB seviyesinde bir FK İLE değil düz bir
 * {@code Long} olarak tutulur (bkz. V35 migration'ındaki gerekçe).
 * {@code workModelId} ise aynı modül içindeki {@link WorkModel}'e normal
 * bir FK ile bağlıdır.
 *
 * <p>Bir çalışanın en fazla bir GÜNCEL ataması olur —
 * {@code organization.EmployeeProfile}'daki AYNI upsert deseni (bkz.
 * {@code WorkModelAssignmentService}).
 */
@Entity
@Table(name = "work_model_assignments")
public class WorkModelAssignment extends BaseEntity {

    @Column(nullable = false)
    private Long employeeId;

    @Column(nullable = false)
    private Long workModelId;

    protected WorkModelAssignment() {
        // JPA için
    }

    public WorkModelAssignment(Long employeeId, Long workModelId) {
        this.employeeId = employeeId;
        this.workModelId = workModelId;
    }

    public void update(Long workModelId) {
        this.workModelId = workModelId;
    }

    public Long getEmployeeId() {
        return employeeId;
    }

    public Long getWorkModelId() {
        return workModelId;
    }
}
