package com.digitalik.recruitment.controller;

import com.digitalik.recruitment.dto.CreateHiringRequestRequest;
import com.digitalik.recruitment.dto.HiringRequestDecisionRequest;
import com.digitalik.recruitment.dto.HiringRequestResponse;
import com.digitalik.recruitment.entity.HiringRequest;
import com.digitalik.recruitment.service.HiringRequestService;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * US-05.3.1: İşe alım talebi oluşturma — norm kadro kontrolüyle (bkz.
 * {@link HiringRequestService}).
 *
 * <p>US-05.3.2: İki aşamalı onay — {@code PUT /{id}/manager-decision} (yalnızca
 * {@code PENDING} iken, yalnızca ADMIN/IK ya da kendi birimindeki bir
 * YONETICI — bkz. {@code teamOrganizationUnitIds}, {@link com.digitalik.recruitment.security.HiringRequestAccessGuard}'daki
 * güven-sınırı notu), sonra {@code PUT /{id}/hr-decision} (yalnızca
 * {@code MANAGER_APPROVED} iken, yalnızca ADMIN/IK — ekip kısıtı yok, İK
 * organizasyon geneli karar verir).
 */
@RestController
@RequestMapping("/api/recruitment/hiring-requests")
public class HiringRequestController {

    private final HiringRequestService hiringRequestService;

    public HiringRequestController(HiringRequestService hiringRequestService) {
        this.hiringRequestService = hiringRequestService;
    }

    @PostMapping
    public ResponseEntity<HiringRequestResponse> create(@RequestBody CreateHiringRequestRequest request) {
        HiringRequest hiringRequest = hiringRequestService.create(request.organizationUnitId(), request.jobTitleId());
        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(hiringRequest));
    }

    @PutMapping("/{id}/manager-decision")
    @PreAuthorize("hasAnyRole('ADMIN', 'IK') or (hasRole('YONETICI') and @hiringRequestAccessGuard.isOwnUnit(#id, #teamOrganizationUnitIds))")
    public HiringRequestResponse managerDecide(
            @PathVariable Long id,
            @RequestBody HiringRequestDecisionRequest request,
            @RequestParam(required = false) List<Long> teamOrganizationUnitIds) {
        boolean approve = parseDecision(request.decision());
        return toResponse(hiringRequestService.managerDecide(id, approve));
    }

    @PutMapping("/{id}/hr-decision")
    @PreAuthorize("hasAnyRole('ADMIN', 'IK')")
    public HiringRequestResponse hrDecide(@PathVariable Long id, @RequestBody HiringRequestDecisionRequest request) {
        boolean approve = parseDecision(request.decision());
        return toResponse(hiringRequestService.hrDecide(id, approve));
    }

    private static boolean parseDecision(String decision) {
        if ("APPROVED".equals(decision)) {
            return true;
        }
        if ("REJECTED".equals(decision)) {
            return false;
        }
        throw new IllegalArgumentException("Karar yalnızca APPROVED veya REJECTED olabilir.");
    }

    private static HiringRequestResponse toResponse(HiringRequest hiringRequest) {
        return new HiringRequestResponse(
                hiringRequest.getId(),
                hiringRequest.getOrganizationUnitId(),
                hiringRequest.getJobTitleId(),
                hiringRequest.getStatus().name());
    }
}
