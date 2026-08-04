package com.digitalik.performance.entity;

import com.digitalik.core.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

/**
 * US-06.2.3: Nihai not hesaplamasında Hedef/Yetkinlik kategorilerinin
 * ağırlığı — {@link RatingScale}'daki AYNI "sistem genelinde TEK yapılandırma
 * kaydı" deseni (bkz. {@code AssessmentWeightConfigService}'teki upsert).
 */
@Entity
@Table(name = "assessment_weight_configs")
public class AssessmentWeightConfig extends BaseEntity {

    @Column(nullable = false)
    private Integer goalWeight;

    @Column(nullable = false)
    private Integer competencyWeight;

    protected AssessmentWeightConfig() {
        // JPA için
    }

    public AssessmentWeightConfig(Integer goalWeight, Integer competencyWeight) {
        this.goalWeight = goalWeight;
        this.competencyWeight = competencyWeight;
    }

    public void update(Integer goalWeight, Integer competencyWeight) {
        this.goalWeight = goalWeight;
        this.competencyWeight = competencyWeight;
    }

    public Integer getGoalWeight() {
        return goalWeight;
    }

    public Integer getCompetencyWeight() {
        return competencyWeight;
    }
}
