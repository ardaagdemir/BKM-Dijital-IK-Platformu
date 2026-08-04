package com.digitalik.attendance.controller;

import com.digitalik.attendance.dto.WorkModelRequest;
import com.digitalik.attendance.dto.WorkModelResponse;
import com.digitalik.attendance.entity.WorkModel;
import com.digitalik.attendance.service.WorkModelService;
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
 * US-07.1.1: Çalışma modeli (ör. "Tam Zamanlı", "Vardiyalı") referans listesi
 * CRUD ekranı — {@code organization.JobTitleController}'daki AYNI desen. Rol
 * kısıtlaması eklenmedi — kabul kriteri bundan bahsetmiyor.
 */
@RestController
@RequestMapping("/api/attendance/work-models")
public class WorkModelController {

    private final WorkModelService workModelService;

    public WorkModelController(WorkModelService workModelService) {
        this.workModelService = workModelService;
    }

    @PostMapping
    public ResponseEntity<WorkModelResponse> create(@RequestBody WorkModelRequest request) {
        WorkModel workModel =
                workModelService.create(request.name(), request.plannedStartTime(), request.plannedEndTime());
        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(workModel));
    }

    @GetMapping
    public List<WorkModelResponse> getAll() {
        return workModelService.getAll().stream().map(WorkModelController::toResponse).toList();
    }

    @PutMapping("/{id}")
    public WorkModelResponse update(@PathVariable Long id, @RequestBody WorkModelRequest request) {
        return toResponse(
                workModelService.update(id, request.name(), request.plannedStartTime(), request.plannedEndTime()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        workModelService.delete(id);
        return ResponseEntity.noContent().build();
    }

    private static WorkModelResponse toResponse(WorkModel workModel) {
        return new WorkModelResponse(
                workModel.getId(), workModel.getName(), workModel.getPlannedStartTime(), workModel.getPlannedEndTime());
    }
}
