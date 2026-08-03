package com.digitalik.performance.controller;

import com.digitalik.performance.dto.GoalRequest;
import com.digitalik.performance.dto.GoalResponse;
import com.digitalik.performance.entity.Goal;
import com.digitalik.performance.service.GoalService;
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
 * US-06.1.1: Hedef referans listesi CRUD ekranı — projedeki {@code performance}
 * modülünün İLK ucu (bkz. {@code organization.JobTitleController}'daki aynı
 * CRUD deseni). Rol kısıtlaması eklenmedi — kabul kriteri bundan bahsetmiyor.
 */
@RestController
@RequestMapping("/api/performance/goals")
public class GoalController {

    private final GoalService goalService;

    public GoalController(GoalService goalService) {
        this.goalService = goalService;
    }

    @PostMapping
    public ResponseEntity<GoalResponse> create(@RequestBody GoalRequest request) {
        Goal goal = goalService.create(request.name(), request.weight());
        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(goal));
    }

    @GetMapping
    public List<GoalResponse> getAll() {
        return goalService.getAll().stream().map(GoalController::toResponse).toList();
    }

    @PutMapping("/{id}")
    public GoalResponse update(@PathVariable Long id, @RequestBody GoalRequest request) {
        return toResponse(goalService.update(id, request.name(), request.weight()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        goalService.delete(id);
        return ResponseEntity.noContent().build();
    }

    private static GoalResponse toResponse(Goal goal) {
        return new GoalResponse(goal.getId(), goal.getName(), goal.getWeight());
    }
}
