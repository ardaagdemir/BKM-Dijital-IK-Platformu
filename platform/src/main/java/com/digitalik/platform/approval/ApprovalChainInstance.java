package com.digitalik.platform.approval;

import com.digitalik.core.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;

/**
 * US-09.2.1: Belirli bir konu (ör. {@code recruitment.HiringRequest})
 * için, belirli bir {@link ApprovalChainDefinition}'ın çalışan bir örneği.
 * {@code subjectType}/{@code subjectId}, projedeki diğer modüller-arası
 * referanslarla (ör. {@code employeeId}) AYNI FK'siz güven-sınırı deseni —
 * {@code platform} hiçbir zaman hangi modülün onu kullandığını bilmiyor.
 *
 * <p>{@code currentStepOrder}, henüz karara bağlanmamış adımı gösterir (1
 * tabanlı). Karar çağrılarının doğru sırayla geldiğini doğrulamak {@code
 * ApprovalChainService}'in sorumluluğu.
 *
 * <p>{@code subjectId} BİLİNÇLİ OLARAK NULLABLE — {@code start()} anında
 * konu (ör. {@code recruitment.HiringRequest}) henüz kendi id'sine sahip
 * DEĞİL (bu id, zincir örneği kaydedildikten SONRA belli oluyor); {@link
 * ApprovalChainService#assignSubject} bu alanı geriye dönük dolduruyor.
 */
@Entity
@Table(name = "approval_chain_instances")
public class ApprovalChainInstance extends BaseEntity {

    @Column(nullable = false)
    private Long chainDefinitionId;

    @Column(nullable = false)
    private String subjectType;

    @Column
    private Long subjectId;

    @Column(nullable = false)
    private int currentStepOrder;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ApprovalChainInstanceStatus status;

    protected ApprovalChainInstance() {
        // JPA için
    }

    public ApprovalChainInstance(Long chainDefinitionId, String subjectType, Long subjectId) {
        this.chainDefinitionId = chainDefinitionId;
        this.subjectType = subjectType;
        this.subjectId = subjectId;
        this.currentStepOrder = 1;
        this.status = ApprovalChainInstanceStatus.IN_PROGRESS;
    }

    public void advanceToNextStep() {
        this.currentStepOrder++;
    }

    public void assignSubjectId(Long subjectId) {
        this.subjectId = subjectId;
    }

    public void approve() {
        this.status = ApprovalChainInstanceStatus.APPROVED;
    }

    public void reject() {
        this.status = ApprovalChainInstanceStatus.REJECTED;
    }

    public Long getChainDefinitionId() {
        return chainDefinitionId;
    }

    public String getSubjectType() {
        return subjectType;
    }

    public Long getSubjectId() {
        return subjectId;
    }

    public int getCurrentStepOrder() {
        return currentStepOrder;
    }

    public ApprovalChainInstanceStatus getStatus() {
        return status;
    }
}
