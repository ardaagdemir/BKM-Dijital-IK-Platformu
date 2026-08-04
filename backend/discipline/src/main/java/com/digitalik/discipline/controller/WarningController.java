package com.digitalik.discipline.controller;

import com.digitalik.discipline.dto.CreateWarningRequest;
import com.digitalik.discipline.dto.WarningResponse;
import com.digitalik.discipline.entity.Warning;
import com.digitalik.discipline.service.WarningService;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * US-08C.1.1: Uyarı kaydı oluşturma/listeleme (tarih, sebep, açıklama) —
 * kabul kriteri yalnızca "Kayıt çalışana bağlanır" diyor. Rol kısıtlaması
 * eklenmedi — kabul kriteri bundan bahsetmiyor.
 */
@RestController
@RequestMapping("/api/discipline/warnings")
public class WarningController {

    private final WarningService warningService;

    public WarningController(WarningService warningService) {
        this.warningService = warningService;
    }

    @PostMapping
    public ResponseEntity<WarningResponse> create(@RequestBody CreateWarningRequest request) {
        Warning warning =
                warningService.create(request.employeeId(), request.date(), request.reason(), request.description());
        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(warning));
    }

    @GetMapping
    public List<WarningResponse> list(@RequestParam(required = false) Long employeeId) {
        return warningService.listByEmployee(employeeId).stream().map(WarningController::toResponse).toList();
    }

    private static WarningResponse toResponse(Warning warning) {
        return new WarningResponse(
                warning.getId(), warning.getEmployeeId(), warning.getDate(), warning.getReason(), warning.getDescription());
    }
}
