package com.digitalik.training.controller;

import com.digitalik.training.dto.CompleteTrainingEnrollmentRequest;
import com.digitalik.training.dto.CompletedTrainingResponse;
import com.digitalik.training.dto.CreateTrainingEnrollmentRequest;
import com.digitalik.training.dto.TrainingEnrollmentDecisionRequest;
import com.digitalik.training.dto.TrainingEnrollmentResponse;
import com.digitalik.training.entity.TrainingEnrollment;
import com.digitalik.training.entity.TrainingEnrollmentStatus;
import com.digitalik.training.service.TrainingEnrollmentService;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * US-08A.1.2: Eğitim talebi oluşturma/onay — {@code leave.LeaveRequestController}'daki
 * (US-04.2.1/US-04.2.2) AYNI "talep→onay" deseninin tekrar kullanımı (roadmap
 * Bölüm 4/5'teki basit onay deseni; Bölüm 9.2'deki merkezi Onay Motoru
 * henüz kurulmadı).
 *
 * <p>{@code PUT /{id}/decision}: "Talep, yöneticiye onaya gider" kabul
 * kriteri, {@code leave}'teki AYNI {@code teamEmployeeIds} (istemci taraflı
 * ekip listesi) + rol kontrolü ile uygulanıyor — bkz.
 * {@link com.digitalik.training.security.TrainingEnrollmentAccessGuard}'daki
 * gerekçe.
 *
 * <p>{@code GET ?employeeId=...}: rol kısıtlaması yok — bkz.
 * {@code TrainingEnrollmentService#listByEmployee}'deki gerekçe.
 *
 * <p>US-08A.1.3: {@code PUT /{id}/complete} ile onaylanmış bir talep
 * "tamamlandı" olarak işaretlenir; {@code GET /completed} ise kabul
 * kriterinin ("çalışan+eğitim+tarih gösterir") istediği raporu döner — bkz.
 * {@code TrainingEnrollmentService#listCompleted}'deki gerekçe.
 */
@RestController
@RequestMapping("/api/training/enrollments")
public class TrainingEnrollmentController {

    private final TrainingEnrollmentService trainingEnrollmentService;

    public TrainingEnrollmentController(TrainingEnrollmentService trainingEnrollmentService) {
        this.trainingEnrollmentService = trainingEnrollmentService;
    }

    @PostMapping
    public ResponseEntity<TrainingEnrollmentResponse> create(@RequestBody CreateTrainingEnrollmentRequest request) {
        TrainingEnrollment enrollment =
                trainingEnrollmentService.create(request.employeeId(), request.trainingId());
        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(enrollment));
    }

    @PutMapping("/{id}/decision")
    @PreAuthorize("hasAnyRole('ADMIN', 'IK') or (hasRole('YONETICI') and "
            + "@trainingEnrollmentAccessGuard.isTeamMember(#id, #teamEmployeeIds))")
    public TrainingEnrollmentResponse decide(
            @PathVariable Long id,
            @RequestBody TrainingEnrollmentDecisionRequest request,
            @RequestParam(required = false) List<Long> teamEmployeeIds) {
        TrainingEnrollmentStatus decision = parseDecision(request.decision());
        return toResponse(trainingEnrollmentService.decide(id, decision, request.rejectionReason()));
    }

    @GetMapping
    public List<TrainingEnrollmentResponse> list(@RequestParam(required = false) Long employeeId) {
        return trainingEnrollmentService.listByEmployee(employeeId).stream()
                .map(TrainingEnrollmentController::toResponse)
                .toList();
    }

    /** US-08A.1.3: Rol kısıtlaması eklenmedi — kabul kriteri bundan bahsetmiyor. */
    @PutMapping("/{id}/complete")
    public TrainingEnrollmentResponse complete(
            @PathVariable Long id, @RequestBody CompleteTrainingEnrollmentRequest request) {
        return toResponse(trainingEnrollmentService.complete(id, request.completedDate()));
    }

    /** US-08A.1.3: {@code employeeId} isteğe bağlı — bkz. {@code TrainingEnrollmentService#listCompleted}'deki gerekçe. */
    @GetMapping("/completed")
    public List<CompletedTrainingResponse> listCompleted(@RequestParam(required = false) Long employeeId) {
        return trainingEnrollmentService.listCompleted(employeeId).stream()
                .map(completed -> new CompletedTrainingResponse(
                        completed.employeeId(), completed.trainingId(), completed.trainingName(), completed.completedDate()))
                .toList();
    }

    private static TrainingEnrollmentStatus parseDecision(String decision) {
        try {
            return TrainingEnrollmentStatus.valueOf(decision);
        } catch (IllegalArgumentException | NullPointerException ex) {
            throw new IllegalArgumentException("Karar yalnızca APPROVED veya REJECTED olabilir.");
        }
    }

    private static TrainingEnrollmentResponse toResponse(TrainingEnrollment enrollment) {
        return new TrainingEnrollmentResponse(
                enrollment.getId(),
                enrollment.getEmployeeId(),
                enrollment.getTrainingId(),
                enrollment.getStatus().name(),
                enrollment.getRejectionReason(),
                enrollment.getCompletedDate());
    }
}
