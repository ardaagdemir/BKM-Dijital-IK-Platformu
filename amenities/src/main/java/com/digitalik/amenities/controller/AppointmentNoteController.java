package com.digitalik.amenities.controller;

import com.digitalik.amenities.dto.AppointmentNoteResponse;
import com.digitalik.amenities.dto.UpdateAppointmentNoteRequest;
import com.digitalik.amenities.entity.Appointment;
import com.digitalik.amenities.service.AppointmentService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * US-08H.1.3 (SEC-020): Randevu notu — sağlık verisi içerebileceğinden
 * kabul kriteri gereği ("Yetkisiz kullanıcı notu göremez") ayrı bir alt
 * kaynak olarak, {@code AppointmentController}'ın normal yanıtlarına HİÇ
 * karışmadan sunuluyor ({@code
 * organization.EmployeeSalaryRecordController}'daki (US-03.3.3/US-03.3.4)
 * AYNI desen).
 *
 * <p>{@code PUT} (not ekleme/güncelleme) BİLİNÇLİ OLARAK kısıtlanmadı —
 * kabul kriteri yalnızca GÖRÜNTÜLEMEDEN bahsediyor. {@code GET} ise
 * yalnızca ADMIN/IK rolüne açık; kaydın/randevunun SAHİBİ (çalışan) için
 * bir istisna YOK — kabul kriteri "yalnızca yetkili kişiler" diyor, self-view
 * değil (`EmployeeSalaryRecordController`'daki US-03.3.4 AYNI karar).
 */
@RestController
@RequestMapping("/api/appointments/{id}/note")
public class AppointmentNoteController {

    private final AppointmentService appointmentService;

    public AppointmentNoteController(AppointmentService appointmentService) {
        this.appointmentService = appointmentService;
    }

    @PutMapping
    public AppointmentNoteResponse updateNote(@PathVariable Long id, @RequestBody UpdateAppointmentNoteRequest request) {
        Appointment appointment = appointmentService.updateNote(id, request.note());
        return toResponse(appointment);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'IK')")
    public AppointmentNoteResponse getNote(@PathVariable Long id) {
        return toResponse(appointmentService.getById(id));
    }

    private static AppointmentNoteResponse toResponse(Appointment appointment) {
        return new AppointmentNoteResponse(appointment.getId(), appointment.getNote());
    }
}
