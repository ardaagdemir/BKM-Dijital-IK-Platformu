package com.digitalik.training.repository;

import com.digitalik.training.entity.TrainingEnrollment;
import com.digitalik.training.entity.TrainingEnrollmentStatus;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TrainingEnrollmentRepository extends JpaRepository<TrainingEnrollment, Long> {

    /** US-08A.1.2: Bir çalışanın geçmiş/mevcut talepleri (en yeni önce) — id zaten oluşturulma sırasıyla tekil/artan. */
    List<TrainingEnrollment> findByEmployeeIdOrderByIdDesc(Long employeeId);

    /** US-08A.1.3: Tamamlanan eğitimler (tüm çalışanlar) — {@code id DESC} ikincil sıralama, aynı tarihli kayıtlar için belirlilik sağlar. */
    List<TrainingEnrollment> findByStatusOrderByCompletedDateDescIdDesc(TrainingEnrollmentStatus status);

    /** US-08A.1.3: Tamamlanan eğitimler, tek bir çalışan bazında. */
    List<TrainingEnrollment> findByStatusAndEmployeeIdOrderByCompletedDateDescIdDesc(
            TrainingEnrollmentStatus status, Long employeeId);
}
