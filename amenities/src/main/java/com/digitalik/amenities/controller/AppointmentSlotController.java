package com.digitalik.amenities.controller;

import com.digitalik.amenities.dto.AppointmentSlotResponse;
import com.digitalik.amenities.dto.CreateAppointmentSlotRequest;
import com.digitalik.amenities.entity.AppointmentSlot;
import com.digitalik.amenities.service.AppointmentSlotService;
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
 * US-08H.1.1: Slot oluşturma/listeleme — kabul kriteri: "Slot çakışması
 * engellenir." Rol kısıtlaması eklenmedi — kabul kriteri bundan
 * bahsetmiyor.
 */
@RestController
@RequestMapping("/api/appointments/slots")
public class AppointmentSlotController {

    private final AppointmentSlotService appointmentSlotService;

    public AppointmentSlotController(AppointmentSlotService appointmentSlotService) {
        this.appointmentSlotService = appointmentSlotService;
    }

    @PostMapping
    public ResponseEntity<AppointmentSlotResponse> create(@RequestBody CreateAppointmentSlotRequest request) {
        AppointmentSlot slot =
                appointmentSlotService.create(request.serviceOfferingId(), request.startTime(), request.endTime());
        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(slot));
    }

    @GetMapping
    public List<AppointmentSlotResponse> list(@RequestParam(required = false) Long serviceOfferingId) {
        return appointmentSlotService.listByService(serviceOfferingId).stream()
                .map(AppointmentSlotController::toResponse)
                .toList();
    }

    private static AppointmentSlotResponse toResponse(AppointmentSlot slot) {
        return new AppointmentSlotResponse(
                slot.getId(), slot.getServiceOfferingId(), slot.getStartTime(), slot.getEndTime());
    }
}
