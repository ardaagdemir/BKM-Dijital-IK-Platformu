package com.digitalik.performance.entity;

import com.digitalik.core.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;

/**
 * US-06.2.1: Bir öz değerlendirmenin, tek bir hedef veya yetkinlik için
 * verilen puanı. {@code itemId}, {@code itemType}'a göre ({@link Goal} ya da
 * {@link Competency}) FARKLI iki tabloya işaret edebildiğinden tek bir DB FK
 * ile kısıtlanamıyor — referans bütünlüğü ({@code Goal}/{@code Competency}
 * gerçekten var mı) {@code SelfAssessmentService} içinde servis seviyesinde
 * doğrulanıyor.
 */
@Entity
@Table(name = "self_assessment_scores")
public class SelfAssessmentScore extends BaseEntity {

    @Column(nullable = false)
    private Long selfAssessmentId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AssessmentItemType itemType;

    @Column(nullable = false)
    private Long itemId;

    @Column(nullable = false)
    private Integer score;

    protected SelfAssessmentScore() {
        // JPA için
    }

    public SelfAssessmentScore(Long selfAssessmentId, AssessmentItemType itemType, Long itemId, Integer score) {
        this.selfAssessmentId = selfAssessmentId;
        this.itemType = itemType;
        this.itemId = itemId;
        this.score = score;
    }

    public Long getSelfAssessmentId() {
        return selfAssessmentId;
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
