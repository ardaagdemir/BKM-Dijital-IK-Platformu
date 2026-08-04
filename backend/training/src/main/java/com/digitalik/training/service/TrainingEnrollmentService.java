package com.digitalik.training.service;

import com.digitalik.core.approval.ApprovalDecisionValidator;
import com.digitalik.training.entity.Training;
import com.digitalik.training.entity.TrainingEnrollment;
import com.digitalik.training.entity.TrainingEnrollmentStatus;
import com.digitalik.training.exception.TrainingEnrollmentNotFoundException;
import com.digitalik.training.exception.TrainingNotFoundException;
import com.digitalik.training.repository.TrainingEnrollmentRepository;
import com.digitalik.training.repository.TrainingRepository;
import java.time.LocalDate;
import java.util.List;
import org.springframework.stereotype.Service;

/**
 * US-08A.1.2: Eğitim talebi oluşturma/karara bağlama —
 * {@code leave.LeaveRequestService}'teki AYNI "talep→onay" deseninin tekrar
 * kullanımı (bakiye/bildirim gibi izin'e özel zenginlik olmadan).
 */
@Service
public class TrainingEnrollmentService {

    private final TrainingEnrollmentRepository trainingEnrollmentRepository;
    private final TrainingRepository trainingRepository;

    public TrainingEnrollmentService(
            TrainingEnrollmentRepository trainingEnrollmentRepository, TrainingRepository trainingRepository) {
        this.trainingEnrollmentRepository = trainingEnrollmentRepository;
        this.trainingRepository = trainingRepository;
    }

    public TrainingEnrollment create(Long employeeId, Long trainingId) {
        if (employeeId == null) {
            throw new IllegalArgumentException("Çalışan boş olamaz.");
        }
        if (trainingId == null) {
            throw new IllegalArgumentException("Eğitim boş olamaz.");
        }
        if (!trainingRepository.existsById(trainingId)) {
            throw new TrainingNotFoundException();
        }

        return trainingEnrollmentRepository.save(new TrainingEnrollment(employeeId, trainingId));
    }

    /**
     * US-08A.1.2: Onay/ret — yalnızca {@code PENDING} bir talep karara
     * bağlanabilir; {@code REJECTED} için gerekçe zorunludur (kabul
     * kriterinin dolaylı, bariz gereği — {@code leave.LeaveRequestService.decide}'daki
     * aynı kural). Talebin gerçekten kararı verenin "ekibinde" olup olmadığı
     * YETKİLENDİRME seviyesinde ({@code @PreAuthorize} +
     * {@code TrainingEnrollmentAccessGuard}) kontrol edilir, burada DEĞİL.
     */
    public TrainingEnrollment decide(Long id, TrainingEnrollmentStatus decision, String rejectionReason) {
        TrainingEnrollment enrollment =
                trainingEnrollmentRepository.findById(id).orElseThrow(TrainingEnrollmentNotFoundException::new);

        ApprovalDecisionValidator.validate(
                enrollment.getStatus(), decision, rejectionReason, "Bu talep zaten karara bağlanmış.");

        if (decision == TrainingEnrollmentStatus.REJECTED) {
            enrollment.reject(rejectionReason);
        } else {
            enrollment.approve();
        }

        return trainingEnrollmentRepository.save(enrollment);
    }

    /** US-08A.1.2: Çalışanın geçmiş/mevcut talepleri. Rol kısıtlaması eklenmedi — kabul kriteri bundan bahsetmiyor. */
    public List<TrainingEnrollment> listByEmployee(Long employeeId) {
        if (employeeId == null) {
            throw new IllegalArgumentException("Çalışan boş olamaz.");
        }
        return trainingEnrollmentRepository.findByEmployeeIdOrderByIdDesc(employeeId);
    }

    /**
     * US-08A.1.3: Onaylanmış bir talebi "tamamlandı" olarak işaretler —
     * "onaylandı" (katılım izni) ile "tamamlandı" (gerçekten katılım
     * sağlandı) kavramsal olarak farklı durumlar (bkz. {@code
     * TrainingEnrollmentStatus} javadoc'u).
     */
    public TrainingEnrollment complete(Long id, LocalDate completedDate) {
        TrainingEnrollment enrollment =
                trainingEnrollmentRepository.findById(id).orElseThrow(TrainingEnrollmentNotFoundException::new);

        if (completedDate == null) {
            throw new IllegalArgumentException("Tamamlanma tarihi boş olamaz.");
        }
        if (enrollment.getStatus() != TrainingEnrollmentStatus.APPROVED) {
            throw new IllegalArgumentException("Yalnızca onaylanmış bir talep tamamlandı olarak işaretlenebilir.");
        }

        enrollment.complete(completedDate);
        return trainingEnrollmentRepository.save(enrollment);
    }

    /**
     * US-08A.1.3: Tamamlanan eğitimler — kabul kriteri "çalışan+eğitim+tarih
     * gösterir" dediğinden, yalnızca id'ler değil eğitim ADI da (bkz.
     * {@link Training}) yanıta dahil ediliyor. {@code employeeId} İSTEĞE
     * BAĞLI — kabul kriterindeki "çalışan bazında" ifadesi, tek bir çalışana
     * ZORUNLU filtrelemeyi değil, listedeki HER SATIRIN çalışan bilgisi
     * taşımasını kastediyor; İK kullanıcısı genel bir rapor da isteyebilir.
     */
    public List<CompletedTraining> listCompleted(Long employeeId) {
        List<TrainingEnrollment> enrollments = employeeId == null
                ? trainingEnrollmentRepository.findByStatusOrderByCompletedDateDescIdDesc(TrainingEnrollmentStatus.COMPLETED)
                : trainingEnrollmentRepository.findByStatusAndEmployeeIdOrderByCompletedDateDescIdDesc(
                        TrainingEnrollmentStatus.COMPLETED, employeeId);

        return enrollments.stream().map(this::toCompletedTraining).toList();
    }

    private CompletedTraining toCompletedTraining(TrainingEnrollment enrollment) {
        Training training = trainingRepository.findById(enrollment.getTrainingId()).orElseThrow(TrainingNotFoundException::new);
        return new CompletedTraining(
                enrollment.getEmployeeId(), enrollment.getTrainingId(), training.getName(), enrollment.getCompletedDate());
    }

    public record CompletedTraining(Long employeeId, Long trainingId, String trainingName, LocalDate completedDate) {
    }
}
