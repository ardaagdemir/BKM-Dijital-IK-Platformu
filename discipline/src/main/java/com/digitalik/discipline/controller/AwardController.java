package com.digitalik.discipline.controller;

import com.digitalik.discipline.dto.AwardResponse;
import com.digitalik.discipline.dto.CreateAwardRequest;
import com.digitalik.discipline.entity.Award;
import com.digitalik.discipline.service.AwardService;
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
 * US-08C.1.4 (EPIC-08C tamamlandı): Ödül kaydı oluşturma/listeleme (takdir
 * belgesi, prim vb.) — kabul kriteri yalnızca "Kayıt çalışana bağlanır"
 * diyor. Rol kısıtlaması eklenmedi — kabul kriteri bundan bahsetmiyor
 * ({@code WarningController}'daki (US-08C.1.1) AYNI karar).
 */
@RestController
@RequestMapping("/api/discipline/awards")
public class AwardController {

    private final AwardService awardService;

    public AwardController(AwardService awardService) {
        this.awardService = awardService;
    }

    @PostMapping
    public ResponseEntity<AwardResponse> create(@RequestBody CreateAwardRequest request) {
        Award award = awardService.create(request.employeeId(), request.type(), request.description());
        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(award));
    }

    @GetMapping
    public List<AwardResponse> list(@RequestParam(required = false) Long employeeId) {
        return awardService.listByEmployee(employeeId).stream().map(AwardController::toResponse).toList();
    }

    private static AwardResponse toResponse(Award award) {
        return new AwardResponse(award.getId(), award.getEmployeeId(), award.getType(), award.getDescription());
    }
}
