package com.digitalik.training.security;

import com.digitalik.training.repository.TrainingEnrollmentRepository;
import java.util.List;
import org.springframework.stereotype.Component;

/**
 * US-08A.1.2: "Talep, yöneticiye onaya gider" kabul kriterinin kayıt bazlı
 * kontrolü — {@code leave.LeaveRequestAccessGuard}'daki (US-04.2.2) AYNI
 * desenin tekrar kullanımı.
 *
 * <p><b>Bilinçli bir güven sınırı:</b> {@code training} modülü {@code
 * organization}'a bağımlı olmadığından, "bu çalışan gerçekten bu yöneticinin
 * ekibinde mi" sorusunu SUNUCU TARAFINDA doğrulayamıyor. Çağıran taraf
 * (frontend), "ekibim" olarak iddia ettiği {@code employeeId} listesini
 * parametre olarak sağlıyor; bu sınıf yalnızca talebin sahibinin bu listede
 * olup olmadığını kontrol ediyor — bkz. {@code LeaveRequestAccessGuard}'daki
 * ayrıntılı gerekçe (docs/04-implementation-log.md, US-04.2.2).
 */
@Component
public class TrainingEnrollmentAccessGuard {

    private final TrainingEnrollmentRepository trainingEnrollmentRepository;

    public TrainingEnrollmentAccessGuard(TrainingEnrollmentRepository trainingEnrollmentRepository) {
        this.trainingEnrollmentRepository = trainingEnrollmentRepository;
    }

    public boolean isTeamMember(Long trainingEnrollmentId, List<Long> teamEmployeeIds) {
        if (trainingEnrollmentId == null || teamEmployeeIds == null || teamEmployeeIds.isEmpty()) {
            return false;
        }

        return trainingEnrollmentRepository
                .findById(trainingEnrollmentId)
                .map(enrollment -> teamEmployeeIds.contains(enrollment.getEmployeeId()))
                .orElse(false);
    }
}
