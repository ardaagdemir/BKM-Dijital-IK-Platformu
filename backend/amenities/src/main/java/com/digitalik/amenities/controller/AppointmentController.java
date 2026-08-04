package com.digitalik.amenities.controller;

import com.digitalik.amenities.dto.AppointmentResponse;
import com.digitalik.amenities.dto.BookAppointmentRequest;
import com.digitalik.amenities.entity.Appointment;
import com.digitalik.amenities.service.AppointmentService;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * US-08H.1.2: Uygun bir slota randevu alma/görüntüleme — kabul kriteri:
 * "Aynı saatte ikinci randevu engellenir." Rol kısıtlaması eklenmedi —
 * kabul kriteri bundan bahsetmiyor.
 */
@RestController
@RequestMapping("/api/appointments")
public class AppointmentController {

    private final AppointmentService appointmentService;

    public AppointmentController(AppointmentService appointmentService) {
        this.appointmentService = appointmentService;
    }

    @PostMapping
    public ResponseEntity<AppointmentResponse> book(@RequestBody BookAppointmentRequest request) {
        Appointment appointment = appointmentService.book(request.slotId(), request.employeeId());
        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(appointment));
    }

    @GetMapping
    public List<AppointmentResponse> list(@RequestParam(required = false) Long employeeId) {
        return appointmentService.listByEmployee(employeeId).stream()
                .map(AppointmentController::toResponse)
                .toList();
    }

    private static AppointmentResponse toResponse(Appointment appointment) {
        return new AppointmentResponse(appointment.getId(), appointment.getSlotId(), appointment.getEmployeeId());
    }
}
