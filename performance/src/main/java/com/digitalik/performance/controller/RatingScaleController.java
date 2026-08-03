package com.digitalik.performance.controller;

import com.digitalik.performance.dto.RatingScaleRequest;
import com.digitalik.performance.dto.RatingScaleResponse;
import com.digitalik.performance.entity.RatingScale;
import com.digitalik.performance.service.RatingScaleService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * US-06.1.2: Puanlama skalası (ör. 1-5) tanımlama/görüntüleme — sistem
 * genelinde TEK bir skala (bkz. {@code RatingScale}/{@code RatingScaleService}'teki
 * upsert deseni). {@code PUT} her zaman upsert; ayrı bir {@code POST} yok,
 * doğal olarak tekil bir kaynak (bkz. {@code organization.EmployeeProfileController}'daki
 * aynı desen). Rol kısıtlaması eklenmedi — kabul kriteri bundan bahsetmiyor.
 */
@RestController
@RequestMapping("/api/performance/rating-scale")
public class RatingScaleController {

    private final RatingScaleService ratingScaleService;

    public RatingScaleController(RatingScaleService ratingScaleService) {
        this.ratingScaleService = ratingScaleService;
    }

    @PutMapping
    public RatingScaleResponse setScale(@RequestBody RatingScaleRequest request) {
        return toResponse(ratingScaleService.setScale(request.minValue(), request.maxValue()));
    }

    @GetMapping
    public RatingScaleResponse getScale() {
        return toResponse(ratingScaleService.getScale());
    }

    private static RatingScaleResponse toResponse(RatingScale ratingScale) {
        return new RatingScaleResponse(ratingScale.getId(), ratingScale.getMinValue(), ratingScale.getMaxValue());
    }
}
