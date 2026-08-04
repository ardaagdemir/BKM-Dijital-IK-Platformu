package com.digitalik.amenities.service;

import com.digitalik.amenities.entity.Appointment;
import com.digitalik.amenities.entity.AppointmentSlot;
import com.digitalik.amenities.exception.AppointmentNotFoundException;
import com.digitalik.amenities.exception.AppointmentSlotNotFoundException;
import com.digitalik.amenities.repository.AppointmentRepository;
import com.digitalik.amenities.repository.AppointmentSlotRepository;
import java.util.List;
import org.springframework.stereotype.Service;

/**
 * US-08H.1.2: Çalışanın bir slota randevu alması. Kabul kriteri: "Aynı
 * saatte ikinci randevu engellenir."
 */
@Service
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final AppointmentSlotRepository appointmentSlotRepository;

    public AppointmentService(
            AppointmentRepository appointmentRepository, AppointmentSlotRepository appointmentSlotRepository) {
        this.appointmentRepository = appointmentRepository;
        this.appointmentSlotRepository = appointmentSlotRepository;
    }

    /**
     * İki bağımsız kontrol uygular: (1) slot zaten rezerve edilmişse
     * ("varsayılan kapasite=1") reddedilir; (2) çalışanın VAR OLAN
     * randevularından biri, bu slotun zaman aralığıyla kesişiyorsa
     * ("aynı saatte ikinci randevu", kabul kriterinin kendisi) reddedilir
     * — farklı slotlar/hizmetler olsa bile.
     */
    public Appointment book(Long slotId, Long employeeId) {
        if (slotId == null) {
            throw new IllegalArgumentException("Slot boş olamaz.");
        }
        AppointmentSlot slot = appointmentSlotRepository.findById(slotId).orElseThrow(AppointmentSlotNotFoundException::new);

        if (employeeId == null) {
            throw new IllegalArgumentException("Çalışan boş olamaz.");
        }

        if (appointmentRepository.existsBySlotId(slotId)) {
            throw new IllegalArgumentException("Bu slot zaten dolu.");
        }

        boolean hasOverlappingAppointment = appointmentRepository.findByEmployeeIdOrderByIdDesc(employeeId).stream()
                .map(existing -> appointmentSlotRepository.findById(existing.getSlotId()).orElseThrow())
                .anyMatch(existingSlot ->
                        existingSlot.getStartTime().isBefore(slot.getEndTime())
                                && existingSlot.getEndTime().isAfter(slot.getStartTime()));
        if (hasOverlappingAppointment) {
            throw new IllegalArgumentException("Aynı saat diliminde başka bir randevunuz var.");
        }

        return appointmentRepository.save(new Appointment(slotId, employeeId));
    }

    /** Rol kısıtlaması eklenmedi — kabul kriteri bundan bahsetmiyor. */
    public List<Appointment> listByEmployee(Long employeeId) {
        if (employeeId == null) {
            throw new IllegalArgumentException("Çalışan boş olamaz.");
        }
        return appointmentRepository.findByEmployeeIdOrderByIdDesc(employeeId);
    }

    /**
     * US-08H.1.3 (SEC-020): Not ekleme/güncelleme BİLİNÇLİ OLARAK
     * kısıtlanmadı — kabul kriteri yalnızca GÖRÜNTÜLEMEDEN ("Yetkisiz
     * kullanıcı notu göremez") bahsediyor; erişim kısıtı {@code
     * AppointmentNoteController.getNote}'taki {@code @PreAuthorize}'da
     * uygulanıyor (`organization.EmployeeSalaryRecordController`'daki
     * US-03.3.4 AYNI karar).
     */
    public Appointment updateNote(Long id, String note) {
        Appointment appointment = appointmentRepository.findById(id).orElseThrow(AppointmentNotFoundException::new);
        appointment.setNote(note);
        return appointmentRepository.save(appointment);
    }

    public Appointment getById(Long id) {
        return appointmentRepository.findById(id).orElseThrow(AppointmentNotFoundException::new);
    }
}
