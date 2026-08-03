package com.digitalik.training.controller;

import com.digitalik.training.dto.TrainingRequest;
import com.digitalik.training.dto.TrainingResponse;
import com.digitalik.training.entity.Training;
import com.digitalik.training.service.TrainingService;
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
 * US-08A.1.1: Eğitim kataloğu (ad, tür, süre, sağlayıcı) CRUD ekranı —
 * {@code attendance.WorkModelController}'daki AYNI desen. Rol kısıtlaması
 * eklenmedi — kabul kriteri bundan bahsetmiyor.
 */
@RestController
@RequestMapping("/api/training/trainings")
public class TrainingController {

    private final TrainingService trainingService;

    public TrainingController(TrainingService trainingService) {
        this.trainingService = trainingService;
    }

    @PostMapping
    public ResponseEntity<TrainingResponse> create(@RequestBody TrainingRequest request) {
        Training training =
                trainingService.create(request.name(), request.type(), request.durationHours(), request.provider());
        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(training));
    }

    @GetMapping
    public List<TrainingResponse> getAll() {
        return trainingService.getAll().stream().map(TrainingController::toResponse).toList();
    }

    @PutMapping("/{id}")
    public TrainingResponse update(@PathVariable Long id, @RequestBody TrainingRequest request) {
        return toResponse(trainingService.update(
                id, request.name(), request.type(), request.durationHours(), request.provider()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        trainingService.delete(id);
        return ResponseEntity.noContent().build();
    }

    private static TrainingResponse toResponse(Training training) {
        return new TrainingResponse(
                training.getId(), training.getName(), training.getType(), training.getDurationHours(),
                training.getProvider());
    }
}
