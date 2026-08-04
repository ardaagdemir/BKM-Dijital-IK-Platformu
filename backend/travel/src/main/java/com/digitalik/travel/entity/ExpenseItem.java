package com.digitalik.travel.entity;

import com.digitalik.core.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import java.math.BigDecimal;

/**
 * US-08B.1.2: Bir seyahat talebine (bkz. {@link TravelRequest}) bağlı masraf
 * kalemi — tutar + belge (makbuz/fatura). {@code travelRequestId}, AYNI
 * modül içindeki {@link TravelRequest}'e normal bir FK ile bağlı.
 *
 * <p>US-09.7.1: Belgenin kendisi ({@code fileName}/{@code contentType}/
 * ikili içerik) artık BURADA DEĞİL — {@code storedFileId}, {@code
 * platform.file.StoredFile}'a GERÇEK bir FK ile bağlı (bkz. {@code
 * com.digitalik.platform.file.FileStorageService}). Bu, diğer modüller-arası
 * {@code employeeId} gibi referanslardan FARKLI: {@code StoredFile}
 * gerçekten {@code platform} modülünün sahipliğinde ve {@code travel} ona
 * Maven bağımlılığıyla gerçekten bağlı (payroll'un leave/attendance/travel'a
 * olan AYNI tek-yönlü istisna deseni).
 *
 * <p>US-08B.1.3: {@code status}/{@link #approve()}/{@link #reject(String)} —
 * {@code leave.LeaveRequest}/{@code training.TrainingEnrollment}'teki AYNI
 * "talep→onay" deseninin tekrar kullanımı; {@code PENDING} durumuyla
 * oluşturulur.
 */
@Entity
@Table(name = "expense_items")
public class ExpenseItem extends BaseEntity {

    @Column(nullable = false)
    private Long travelRequestId;

    @Column(nullable = false)
    private BigDecimal amount;

    @Column(nullable = false)
    private Long storedFileId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ExpenseItemStatus status;

    private String rejectionReason;

    protected ExpenseItem() {
        // JPA için
    }

    public ExpenseItem(Long travelRequestId, BigDecimal amount, Long storedFileId) {
        this.travelRequestId = travelRequestId;
        this.amount = amount;
        this.storedFileId = storedFileId;
        this.status = ExpenseItemStatus.PENDING;
    }

    public void approve() {
        this.status = ExpenseItemStatus.APPROVED;
    }

    public void reject(String rejectionReason) {
        this.status = ExpenseItemStatus.REJECTED;
        this.rejectionReason = rejectionReason;
    }

    public Long getTravelRequestId() {
        return travelRequestId;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public Long getStoredFileId() {
        return storedFileId;
    }

    public ExpenseItemStatus getStatus() {
        return status;
    }

    public String getRejectionReason() {
        return rejectionReason;
    }
}
