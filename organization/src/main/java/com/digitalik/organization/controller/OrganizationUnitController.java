package com.digitalik.organization.controller;

import com.digitalik.organization.dto.CreateOrganizationUnitRequest;
import com.digitalik.organization.dto.OrganizationUnitResponse;
import com.digitalik.organization.entity.OrganizationUnit;
import com.digitalik.organization.service.OrganizationUnitService;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * US-03.1.1: Şirket/İşyeri/Bölüm hiyerarşisini oluşturma ve görüntüleme.
 *
 * <p>Bu uçlar özel bir rol kısıtlaması ({@code @PreAuthorize}) taşımaz;
 * platform genelindeki {@code auth.security.SecurityConfig} kuralı
 * (yalnızca {@code /api/auth/login} hariç her isteğin kimlik doğrulaması
 * gerektirmesi) zaten geçerlidir. "Yalnızca İK/Admin oluşturabilir" gibi
 * daha ince bir rol kısıtlaması, ihtiyaç netleşmeden eklenmedi (YAGNI).
 */
@RestController
@RequestMapping("/api/organization/units")
public class OrganizationUnitController {

    private final OrganizationUnitService organizationUnitService;

    public OrganizationUnitController(OrganizationUnitService organizationUnitService) {
        this.organizationUnitService = organizationUnitService;
    }

    @PostMapping
    public ResponseEntity<OrganizationUnitResponse> create(@RequestBody CreateOrganizationUnitRequest request) {
        OrganizationUnit unit = organizationUnitService.create(request.name(), request.parentId());
        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(unit));
    }

    @GetMapping
    public List<OrganizationUnitResponse> getAll() {
        return organizationUnitService.getAll().stream()
                .map(OrganizationUnitController::toResponse)
                .toList();
    }

    private static OrganizationUnitResponse toResponse(OrganizationUnit unit) {
        return new OrganizationUnitResponse(unit.getId(), unit.getName(), unit.getParentId());
    }
}
