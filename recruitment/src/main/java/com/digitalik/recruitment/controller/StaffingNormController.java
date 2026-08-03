package com.digitalik.recruitment.controller;

import com.digitalik.recruitment.dto.StaffingNormRequest;
import com.digitalik.recruitment.dto.StaffingNormResponse;
import com.digitalik.recruitment.entity.StaffingNorm;
import com.digitalik.recruitment.service.StaffingNormService;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * US-05.1.1: Norm kadro tanımlama — projedeki {@code recruitment} modülünün
 * İLK ucu. {@code PUT} upsert semantiğinde (bkz. {@code StaffingNormService});
 * ayrı bir {@code POST}/{@code PUT .../{id}} ikilisi yok, çünkü doğal
 * anahtar (birim+unvan) zaten benzersiz bir kaydı belirliyor.
 *
 * <p>Rol kısıtlaması eklenmedi — kabul kriteri bundan bahsetmiyor,
 * {@code organization.JobTitleController}'daki aynı emsal.
 */
@RestController
@RequestMapping("/api/recruitment/staffing-norms")
public class StaffingNormController {

    private final StaffingNormService staffingNormService;

    public StaffingNormController(StaffingNormService staffingNormService) {
        this.staffingNormService = staffingNormService;
    }

    @PutMapping
    public StaffingNormResponse setNorm(@RequestBody StaffingNormRequest request) {
        StaffingNorm staffingNorm =
                staffingNormService.setNorm(request.organizationUnitId(), request.jobTitleId(), request.normCount());
        return toResponse(staffingNorm);
    }

    @GetMapping
    public List<StaffingNormResponse> getAll() {
        return staffingNormService.getAll().stream().map(StaffingNormController::toResponse).toList();
    }

    private static StaffingNormResponse toResponse(StaffingNorm staffingNorm) {
        return new StaffingNormResponse(
                staffingNorm.getId(), staffingNorm.getOrganizationUnitId(), staffingNorm.getJobTitleId(),
                staffingNorm.getNormCount());
    }
}
