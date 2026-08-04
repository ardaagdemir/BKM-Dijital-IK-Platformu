package com.digitalik.amenities.controller;

import com.digitalik.amenities.dto.ServiceOfferingRequest;
import com.digitalik.amenities.dto.ServiceOfferingResponse;
import com.digitalik.amenities.entity.ServiceOffering;
import com.digitalik.amenities.service.ServiceOfferingService;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * US-08H.1.1: Hizmet tanımlama (+ CRUD, {@code
 * organization.JobTitleController}'daki AYNI desen). Rol kısıtlaması
 * eklenmedi — kabul kriteri bundan bahsetmiyor.
 */
@RestController
@RequestMapping("/api/appointments/services")
public class ServiceOfferingController {

    private final ServiceOfferingService serviceOfferingService;

    public ServiceOfferingController(ServiceOfferingService serviceOfferingService) {
        this.serviceOfferingService = serviceOfferingService;
    }

    @PostMapping
    public ResponseEntity<ServiceOfferingResponse> create(@RequestBody ServiceOfferingRequest request) {
        ServiceOffering serviceOffering = serviceOfferingService.create(request.name());
        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(serviceOffering));
    }

    @GetMapping
    public List<ServiceOfferingResponse> getAll() {
        return serviceOfferingService.getAll().stream().map(ServiceOfferingController::toResponse).toList();
    }

    @PutMapping("/{id}")
    public ServiceOfferingResponse update(@PathVariable Long id, @RequestBody ServiceOfferingRequest request) {
        return toResponse(serviceOfferingService.update(id, request.name()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        serviceOfferingService.delete(id);
        return ResponseEntity.noContent().build();
    }

    private static ServiceOfferingResponse toResponse(ServiceOffering serviceOffering) {
        return new ServiceOfferingResponse(serviceOffering.getId(), serviceOffering.getName());
    }
}
