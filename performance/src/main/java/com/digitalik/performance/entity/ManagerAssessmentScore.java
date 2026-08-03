package com.digitalik.performance.entity;

import com.digitalik.core.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;

/**
 * US-06.2.2: Bir yönetici değerlendirmesinin, tek bir hedef/yetkinlik için
 * verdiği puan — {@link SelfAssessmentScore}'daki (US-06.2.1) aynı gerekçeyle
 * {@code itemId} için tek bir DB FK yok, referans bütünlüğü
 * {@code ManagerAssessmentService} içinde servis seviyesinde doğrulanıyor.
 */
@Entity
@Table(name = "manager_assessment_scores")
public class ManagerAssessmentScore extends BaseEntity {

    @Column(nullable = false)
    private Long managerAssessmentId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AssessmentItemType itemType;

    @Column(nullable = false)
    private Long itemId;

    @Column(nullable = false)
    private Integer score;

    protected ManagerAssessmentScore() {
        // JPA için
    }

    public ManagerAssessmentScore(Long managerAssessmentId, AssessmentItemType itemType, Long itemId, Integer score) {
        this.managerAssessmentId = managerAssessmentId;
        this.itemType = itemType;
        this.itemId = itemId;
        this.score = score;
    }

    public Long getManagerAssessmentId() {
        return managerAssessmentId;
    }

    public AssessmentItemType getItemType() {
        return itemType;
    }

    public Long getItemId() {
        return itemId;
    }

    public Integer getScore() {
        return score;
    }
}
