package com.digitalik.performance.controller;

import com.digitalik.performance.dto.AssessmentWeightConfigRequest;
import com.digitalik.performance.dto.AssessmentWeightConfigResponse;
import com.digitalik.performance.entity.AssessmentWeightConfig;
import com.digitalik.performance.service.AssessmentWeightConfigService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * US-06.2.3: Nihai not ağırlıklandırması (Hedef %/Yetkinlik %) tanımlama/görüntüleme
 * — {@code RatingScaleController}'daki AYNI "sistem genelinde tekil kaynak,
 * PUT her zaman upsert" deseni. Rol kısıtlaması eklenmedi — kabul kriteri
 * bundan bahsetmiyor.
 */
@RestController
@RequestMapping("/api/performance/assessment-weight-config")
public class AssessmentWeightConfigController {

    private final AssessmentWeightConfigService assessmentWeightConfigService;

    public AssessmentWeightConfigController(AssessmentWeightConfigService assessmentWeightConfigService) {
        this.assessmentWeightConfigService = assessmentWeightConfigService;
    }

    @PutMapping
    public AssessmentWeightConfigResponse setConfig(@RequestBody AssessmentWeightConfigRequest request) {
        return toResponse(assessmentWeightConfigService.setConfig(request.goalWeight(), request.competencyWeight()));
    }

    @GetMapping
    public AssessmentWeightConfigResponse getConfig() {
        return toResponse(assessmentWeightConfigService.getConfig());
    }

    private static AssessmentWeightConfigResponse toResponse(AssessmentWeightConfig config) {
        return new AssessmentWeightConfigResponse(config.getId(), config.getGoalWeight(), config.getCompetencyWeight());
    }
}
