package com.digitalik.training.entity;

import com.digitalik.core.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import java.time.LocalDate;

/**
 * US-08A.1.2: Bir çalışanın katalogdan (bkz. {@link Training}) eğitim talebi
 * — {@code leave.LeaveRequest}'teki (US-04.2.1/US-04.2.2) AYNI "talep→onay"
 * deseninin tekrar kullanımı: {@code PENDING} durumuyla oluşturulur,
 * {@link #approve()}/{@link #reject(String)} ile karara bağlanır.
 *
 * <p>{@code employeeId}, {@code organization.Employee}'ye DB seviyesinde bir
 * FK İLE değil düz bir {@code Long} olarak tutulur — {@code leave}/{@code
 * performance}/{@code attendance}'taki AYNI modüller-arası güven sınırı
 * gerekçesi. {@code trainingId} ise AYNI modül içindeki {@link Training}'e
 * normal bir FK ile bağlı.
 */
@Entity
@Table(name = "training_enrollments")
public class TrainingEnrollment extends BaseEntity {

    @Column(nullable = false)
    private Long employeeId;

    @Column(nullable = false)
    private Long trainingId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TrainingEnrollmentStatus status;

    private String rejectionReason;

    private LocalDate completedDate;

    protected TrainingEnrollment() {
        // JPA için
    }

    public TrainingEnrollment(Long employeeId, Long trainingId) {
        this.employeeId = employeeId;
        this.trainingId = trainingId;
        this.status = TrainingEnrollmentStatus.PENDING;
    }

    public void approve() {
        this.status = TrainingEnrollmentStatus.APPROVED;
    }

    public void reject(String rejectionReason) {
        this.status = TrainingEnrollmentStatus.REJECTED;
        this.rejectionReason = rejectionReason;
    }

    /** US-08A.1.3: Yalnızca {@code APPROVED} bir talep tamamlanmış olarak işaretlenebilir — bkz. {@code TrainingEnrollmentService}. */
    public void complete(LocalDate completedDate) {
        this.status = TrainingEnrollmentStatus.COMPLETED;
        this.completedDate = completedDate;
    }

    public Long getEmployeeId() {
        return employeeId;
    }

    public Long getTrainingId() {
        return trainingId;
    }

    public TrainingEnrollmentStatus getStatus() {
        return status;
    }

    public String getRejectionReason() {
        return rejectionReason;
    }

    public LocalDate getCompletedDate() {
        return completedDate;
    }
}
