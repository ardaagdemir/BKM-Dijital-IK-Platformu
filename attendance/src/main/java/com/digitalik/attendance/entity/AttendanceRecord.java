package com.digitalik.attendance.entity;

import com.digitalik.core.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import java.time.OffsetDateTime;

/**
 * US-07.2.1: PDKS'ten alınan fiili giriş-çıkış verisi — {@code employeeId},
 * {@code work_model_assignments}'taki (V35) AYNI gerekçeyle DB seviyesinde
 * bir FK İLE değil düz bir {@code Long} olarak tutulur.
 *
 * <p>{@code checkOutAt} NULLABLE — bkz. V36 migration'ındaki gerekçe.
 */
@Entity
@Table(name = "attendance_records")
public class AttendanceRecord extends BaseEntity {

    @Column(nullable = false)
    private Long employeeId;

    @Column(nullable = false)
    private OffsetDateTime checkInAt;

    private OffsetDateTime checkOutAt;

    protected AttendanceRecord() {
        // JPA için
    }

    public AttendanceRecord(Long employeeId, OffsetDateTime checkInAt, OffsetDateTime checkOutAt) {
        this.employeeId = employeeId;
        this.checkInAt = checkInAt;
        this.checkOutAt = checkOutAt;
    }

    public Long getEmployeeId() {
        return employeeId;
    }

    public OffsetDateTime getCheckInAt() {
        return checkInAt;
    }

    public OffsetDateTime getCheckOutAt() {
        return checkOutAt;
    }
}
