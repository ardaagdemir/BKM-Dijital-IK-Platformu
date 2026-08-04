package com.digitalik.discipline.controller;

import com.digitalik.discipline.dto.CreateDisciplinaryCaseRequest;
import com.digitalik.discipline.dto.DisciplinaryCaseResponse;
import com.digitalik.discipline.dto.RecordDefenseRequest;
import com.digitalik.discipline.entity.DisciplinaryCase;
import com.digitalik.discipline.service.DisciplinaryCaseService;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * US-08C.1.2: Ceza süreci kaydı — açma, savunma kaydetme, kapatma. Kabul
 * kriteri: "çalışan savunması alınmadan süreç kapanmamalı." Rol
 * kısıtlaması eklenmedi — kabul kriteri bundan bahsetmiyor ({@code
 * WarningController}'daki (US-08C.1.1) AYNI karar).
 *
 * <p>US-08C.1.3: {@code {id}} yol değişkeni her zaman sürecin KÖK (ilk
 * revizyon) id'sidir — {@code DisciplinaryCaseService} her değişiklikte
 * yeni bir revizyon satırı eklese de, {@link #toResponse} her zaman {@code
 * rootCaseId()}'i döndürdüğünden istemci açısından "süreç id"si sürecin
 * ömrü boyunca DEĞİŞMEZ.
 */
@RestController
@RequestMapping("/api/discipline/cases")
public class DisciplinaryCaseController {

    private final DisciplinaryCaseService disciplinaryCaseService;

    public DisciplinaryCaseController(DisciplinaryCaseService disciplinaryCaseService) {
        this.disciplinaryCaseService = disciplinaryCaseService;
    }

    @PostMapping
    public ResponseEntity<DisciplinaryCaseResponse> create(@RequestBody CreateDisciplinaryCaseRequest request) {
        DisciplinaryCase disciplinaryCase = disciplinaryCaseService.create(request.employeeId(), request.reason());
        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(disciplinaryCase));
    }

    @PutMapping("/{id}/defense")
    public DisciplinaryCaseResponse recordDefense(@PathVariable Long id, @RequestBody RecordDefenseRequest request) {
        return toResponse(disciplinaryCaseService.recordDefense(id, request.defense()));
    }

    @PutMapping("/{id}/close")
    public DisciplinaryCaseResponse close(@PathVariable Long id) {
        return toResponse(disciplinaryCaseService.close(id));
    }

    @GetMapping
    public List<DisciplinaryCaseResponse> list(@RequestParam(required = false) Long employeeId) {
        return disciplinaryCaseService.listByEmployee(employeeId).stream()
                .map(DisciplinaryCaseController::toResponse)
                .toList();
    }

    private static DisciplinaryCaseResponse toResponse(DisciplinaryCase disciplinaryCase) {
        return new DisciplinaryCaseResponse(
                disciplinaryCase.rootCaseId(),
                disciplinaryCase.getEmployeeId(),
                disciplinaryCase.getReason(),
                disciplinaryCase.getDefense(),
                disciplinaryCase.getStatus());
    }
}
