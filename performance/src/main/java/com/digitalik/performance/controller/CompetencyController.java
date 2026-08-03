package com.digitalik.performance.controller;

import com.digitalik.performance.dto.CompetencyRequest;
import com.digitalik.performance.dto.CompetencyResponse;
import com.digitalik.performance.entity.Competency;
import com.digitalik.performance.service.CompetencyService;
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
 * US-06.1.1: Yetkinlik referans listesi CRUD ekranı — bkz. {@link GoalController}'daki
 * aynı desen. Rol kısıtlaması eklenmedi — kabul kriteri bundan bahsetmiyor.
 */
@RestController
@RequestMapping("/api/performance/competencies")
public class CompetencyController {

    private final CompetencyService competencyService;

    public CompetencyController(CompetencyService competencyService) {
        this.competencyService = competencyService;
    }

    @PostMapping
    public ResponseEntity<CompetencyResponse> create(@RequestBody CompetencyRequest request) {
        Competency competency = competencyService.create(request.name(), request.weight());
        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(competency));
    }

    @GetMapping
    public List<CompetencyResponse> getAll() {
        return competencyService.getAll().stream().map(CompetencyController::toResponse).toList();
    }

    @PutMapping("/{id}")
    public CompetencyResponse update(@PathVariable Long id, @RequestBody CompetencyRequest request) {
        return toResponse(competencyService.update(id, request.name(), request.weight()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        competencyService.delete(id);
        return ResponseEntity.noContent().build();
    }

    private static CompetencyResponse toResponse(Competency competency) {
        return new CompetencyResponse(competency.getId(), competency.getName(), competency.getWeight());
    }
}
