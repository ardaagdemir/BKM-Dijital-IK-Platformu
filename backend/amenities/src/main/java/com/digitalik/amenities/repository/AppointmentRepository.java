package com.digitalik.amenities.repository;

import com.digitalik.amenities.entity.Appointment;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    /** US-08H.1.2: Bir slotun zaten rezerve edilip edilmediğini kontrol etmek için (varsayılan kapasite=1). */
    boolean existsBySlotId(Long slotId);

    /** US-08H.1.2: Bir çalışanın mevcut/geçmiş randevuları (en yeni önce) — çakışma kontrolü ve kendi listesi için. */
    List<Appointment> findByEmployeeIdOrderByIdDesc(Long employeeId);
}
