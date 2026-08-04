package com.digitalik.platform.approval;

import com.digitalik.platform.approval.dto.ApprovalChainResponse;
import com.digitalik.platform.approval.dto.ApprovalChainStepResponse;
import com.digitalik.platform.approval.dto.CreateApprovalChainRequest;
import com.digitalik.platform.approval.dto.UpdateApprovalChainStepsRequest;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * US-09.2.2 kabul kriteri: "Sistem yöneticisi olarak, yeni bir onay
 * zincirini kod yazmadan tanımlamak istiyorum. Zincir adım sayısı/
 * onaylayıcı rolü ekrandan yapılandırılır." Hiçbir modülde henüz bir
 * admin ekranı yok — kabul kriterinin "ekrandan" şartı, bu projenin Bölüm
 * 1-8 boyunca izlediği "önce backend API, ekran sonra" deseniyle yalnızca
 * bir REST API olarak karşılanıyor.
 *
 * <p>Tüm uçlar yalnızca ADMIN rolüne açık — "Sistem yöneticisi" kabul
 * kriterinin doğrudan karşılığı.
 */
@RestController
@RequestMapping("/api/platform/approval-chains")
@PreAuthorize("hasRole('ADMIN')")
public class ApprovalChainDefinitionController {

    private final ApprovalChainDefinitionService approvalChainDefinitionService;

    public ApprovalChainDefinitionController(ApprovalChainDefinitionService approvalChainDefinitionService) {
        this.approvalChainDefinitionService = approvalChainDefinitionService;
    }

    @PostMapping
    public ResponseEntity<ApprovalChainResponse> create(@RequestBody CreateApprovalChainRequest request) {
        ApprovalChainDefinition definition =
                approvalChainDefinitionService.create(request.name(), request.orderedRequiredRoles());
        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(definition));
    }

    @GetMapping
    public List<ApprovalChainResponse> getAll() {
        return approvalChainDefinitionService.getAll().stream().map(this::toResponse).toList();
    }

    @PutMapping("/{id}/steps")
    public ApprovalChainResponse updateSteps(
            @PathVariable Long id, @RequestBody UpdateApprovalChainStepsRequest request) {
        return toResponse(approvalChainDefinitionService.updateSteps(id, request.orderedRequiredRoles()));
    }

    private ApprovalChainResponse toResponse(ApprovalChainDefinition definition) {
        List<ApprovalChainStepResponse> steps = approvalChainDefinitionService.getSteps(definition.getId()).stream()
                .map(step -> new ApprovalChainStepResponse(step.getStepOrder(), step.getRequiredRole()))
                .toList();
        return new ApprovalChainResponse(definition.getId(), definition.getName(), steps);
    }
}
