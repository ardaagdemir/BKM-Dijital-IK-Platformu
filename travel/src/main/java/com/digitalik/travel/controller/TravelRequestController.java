package com.digitalik.travel.controller;

import com.digitalik.travel.dto.CreateTravelRequestRequest;
import com.digitalik.travel.dto.TravelRequestResponse;
import com.digitalik.travel.entity.TravelRequest;
import com.digitalik.travel.service.TravelRequestService;
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
 * US-08B.1.1: Seyahat talebi oluşturma/listeleme (lokasyon, tarih aralığı,
 * amaç) — kabul kriteri yalnızca "Form kaydedilir" diyor, bu story'de bir
 * onay akışı YOK (bkz. {@code TravelRequest} javadoc'u). Rol kısıtlaması
 * eklenmedi — kabul kriteri bundan bahsetmiyor.
 */
@RestController
@RequestMapping("/api/travel/requests")
public class TravelRequestController {

    private final TravelRequestService travelRequestService;

    public TravelRequestController(TravelRequestService travelRequestService) {
        this.travelRequestService = travelRequestService;
    }

    @PostMapping
    public ResponseEntity<TravelRequestResponse> create(@RequestBody CreateTravelRequestRequest request) {
        TravelRequest travelRequest = travelRequestService.create(
                request.employeeId(), request.location(), request.startDate(), request.endDate(), request.purpose());
        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(travelRequest));
    }

    @GetMapping
    public List<TravelRequestResponse> list(@RequestParam(required = false) Long employeeId) {
        return travelRequestService.listByEmployee(employeeId).stream()
                .map(TravelRequestController::toResponse)
                .toList();
    }

    private static TravelRequestResponse toResponse(TravelRequest travelRequest) {
        return new TravelRequestResponse(
                travelRequest.getId(),
                travelRequest.getEmployeeId(),
                travelRequest.getLocation(),
                travelRequest.getStartDate(),
                travelRequest.getEndDate(),
                travelRequest.getPurpose());
    }
}
