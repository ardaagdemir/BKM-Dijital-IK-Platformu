package com.digitalik.performance.service;

import com.digitalik.performance.entity.AssessmentWeightConfig;
import com.digitalik.performance.exception.AssessmentWeightConfigNotFoundException;
import com.digitalik.performance.repository.AssessmentWeightConfigRepository;
import org.springframework.stereotype.Service;

/**
 * US-06.2.3: Nihai not ağırlıklandırması (Hedef %/Yetkinlik %) tanımlama/görüntüleme
 * — {@code RatingScaleService}'teki AYNI upsert deseni (bkz. {@code AssessmentWeightConfig}
 * javadoc'u).
 */
@Service
public class AssessmentWeightConfigService {

    private final AssessmentWeightConfigRepository assessmentWeightConfigRepository;

    public AssessmentWeightConfigService(AssessmentWeightConfigRepository assessmentWeightConfigRepository) {
        this.assessmentWeightConfigRepository = assessmentWeightConfigRepository;
    }

    public AssessmentWeightConfig setConfig(Integer goalWeight, Integer competencyWeight) {
        if (goalWeight == null || competencyWeight == null) {
            throw new IllegalArgumentException("Hedef ve yetkinlik ağırlıkları boş olamaz.");
        }
        if (goalWeight < 0 || competencyWeight < 0) {
            throw new IllegalArgumentException("Ağırlıklar negatif olamaz.");
        }
        if (goalWeight + competencyWeight != 100) {
            throw new IllegalArgumentException("Hedef ve yetkinlik ağırlıklarının toplamı 100 olmalıdır.");
        }

        AssessmentWeightConfig config = assessmentWeightConfigRepository
                .findFirstByOrderByIdAsc()
                .orElseGet(() -> new AssessmentWeightConfig(goalWeight, competencyWeight));
        config.update(goalWeight, competencyWeight);

        return assessmentWeightConfigRepository.save(config);
    }

    public AssessmentWeightConfig getConfig() {
        return assessmentWeightConfigRepository
                .findFirstByOrderByIdAsc()
                .orElseThrow(AssessmentWeightConfigNotFoundException::new);
    }
}
