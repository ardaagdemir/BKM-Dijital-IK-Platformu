package com.digitalik.leave.entity;

import com.digitalik.core.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

/**
 * US-04.2.1: Bir çalışanın izin talebi (tür, tarih aralığı) — {@code PENDING}
 * durumuyla oluşturulur.
 *
 * <p>US-04.2.2: {@link #approve()}/{@link #reject(String)} ile karara
 * bağlanır. "Karar veren"/"karar tarihi" alanları eklenmedi — bu bilgi zaten
 * {@link BaseEntity}'nin {@code updatedBy}/{@code updatedAt} alanlarından
 * (ve audit_log'dan) bedavaya geliyor, tekrar tutulmasına gerek yok.
 *
 * <p>{@code employeeId}, {@code organization.Employee}'ye DB seviyesinde bir
 * FK İLE değil düz bir {@code Long} olarak tutulur — bkz. V19 migration'ındaki
 * ayrıntılı not (modül bağımsızlığı, {@code leave} organization'a bağımlı
 * değil).
 *
 * <p>US-04.3.1: {@code employeeEmail}, aynı gerekçeyle (modül bağımsızlığı)
 * çağıran taraf isterse OLUŞTURMA anında sağlar — {@code hireDate}'in aksine
 * (yalnızca o an kullanılıp atılır) burada KALICI olarak saklanıyor, çünkü
 * karar (onay/ret) e-postası çok daha SONRA, ayrı bir HTTP isteğinde
 * ({@code decide}) gönderiliyor ve o an bu bilgiye tekrar ihtiyaç var.
 */
@Entity
@Table(name = "leave_requests")
public class LeaveRequest extends BaseEntity {

    @Column(nullable = false)
    private Long employeeId;

    @Column(nullable = false)
    private Long leaveTypeId;

    @Column(nullable = false)
    private LocalDate startDate;

    @Column(nullable = false)
    private LocalDate endDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private LeaveRequestStatus status;

    @Column
    private String rejectionReason;

    @Column
    private String employeeEmail;

    protected LeaveRequest() {
        // JPA için
    }

    public LeaveRequest(Long employeeId, Long leaveTypeId, LocalDate startDate, LocalDate endDate) {
        this(employeeId, leaveTypeId, startDate, endDate, null);
    }

    public LeaveRequest(
            Long employeeId, Long leaveTypeId, LocalDate startDate, LocalDate endDate, String employeeEmail) {
        this.employeeId = employeeId;
        this.leaveTypeId = leaveTypeId;
        this.startDate = startDate;
        this.endDate = endDate;
        this.status = LeaveRequestStatus.PENDING;
        this.employeeEmail = employeeEmail;
    }

    public void approve() {
        this.status = LeaveRequestStatus.APPROVED;
    }

    public void reject(String rejectionReason) {
        this.status = LeaveRequestStatus.REJECTED;
        this.rejectionReason = rejectionReason;
    }

    public Long getEmployeeId() {
        return employeeId;
    }

    public Long getLeaveTypeId() {
        return leaveTypeId;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public LeaveRequestStatus getStatus() {
        return status;
    }

    public String getRejectionReason() {
        return rejectionReason;
    }

    public String getEmployeeEmail() {
        return employeeEmail;
    }

    /**
     * US-04.2.3: {@code LeaveBalanceService} bu metodu, onaylanan/bekleyen
     * talepleri gün bazında toplarken kullanıyor — hesaplama {@code create}
     * sırasında ({@code LeaveRequestService}) ve {@code decision} yanıtında
     * ({@code LeaveRequestController}) da gerektiğinden, üçüncü tekrarı
     * önlemek için entity'ye taşındı.
     */
    public long getRequestedDays() {
        return ChronoUnit.DAYS.between(startDate, endDate) + 1;
    }
}
