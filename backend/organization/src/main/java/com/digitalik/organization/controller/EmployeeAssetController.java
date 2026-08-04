package com.digitalik.organization.controller;

import com.digitalik.organization.dto.CreateEmployeeAssetRequest;
import com.digitalik.organization.dto.EmployeeAssetResponse;
import com.digitalik.organization.dto.ReturnEmployeeAssetRequest;
import com.digitalik.organization.entity.EmployeeAsset;
import com.digitalik.organization.service.EmployeeAssetService;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * US-03.3.2: Çalışana ait zimmet kayıtları (birden fazla kalem, teslim/iade
 * tarihi). {@link EmployeeController}'daki {@code /profile} (1:1) alt
 * kaynağından farklı olarak, burada bir ÇOKLU-KAYIT alt kaynağı olduğundan
 * (liste + tekil iade işlemi) ayrı bir controller'a çıkarıldı — bu, aynı
 * zamanda {@code EmployeeController}'ın büyümesini sınırlıyor.
 *
 * <p>Rol kısıtlaması (ör. {@code EmployeeAccessGuard}) bilinçli olarak
 * EKLENMEDİ — zimmet, US-03.3.1'deki kimlik/adres gibi kişisel/hassas veri
 * değil, bir envanter/zimmet kaydı; bu modüldeki çoğu uçla (temel bilgi
 * oluşturma/güncelleme, atama) aynı emsal korunuyor.
 */
@RestController
@RequestMapping("/api/organization/employees/{employeeId}/assets")
public class EmployeeAssetController {

    private final EmployeeAssetService employeeAssetService;

    public EmployeeAssetController(EmployeeAssetService employeeAssetService) {
        this.employeeAssetService = employeeAssetService;
    }

    @PostMapping
    public ResponseEntity<EmployeeAssetResponse> deliver(
            @PathVariable Long employeeId, @RequestBody CreateEmployeeAssetRequest request) {
        EmployeeAsset asset = employeeAssetService.deliver(employeeId, request.itemName(), request.deliveredAt());
        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(asset));
    }

    @GetMapping
    public List<EmployeeAssetResponse> list(@PathVariable Long employeeId) {
        return employeeAssetService.listByEmployee(employeeId).stream()
                .map(EmployeeAssetController::toResponse)
                .toList();
    }

    @PutMapping("/{assetId}/return")
    public EmployeeAssetResponse markReturned(
            @PathVariable Long employeeId,
            @PathVariable Long assetId,
            @RequestBody ReturnEmployeeAssetRequest request) {
        EmployeeAsset asset = employeeAssetService.markReturned(employeeId, assetId, request.returnedAt());
        return toResponse(asset);
    }

    private static EmployeeAssetResponse toResponse(EmployeeAsset asset) {
        return new EmployeeAssetResponse(
                asset.getId(), asset.getEmployeeId(), asset.getItemName(), asset.getDeliveredAt(), asset.getReturnedAt());
    }
}
