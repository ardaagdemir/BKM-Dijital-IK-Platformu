package com.digitalik.amenities.controller;

import com.digitalik.amenities.dto.ClubEventResponse;
import com.digitalik.amenities.dto.CreateClubEventRequest;
import com.digitalik.amenities.entity.ClubEvent;
import com.digitalik.amenities.service.ClubEventService;
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
 * US-08G.1.2: Kulüp etkinliği oluşturma/listeleme — kabul kriteri:
 * "Etkinlik yalnızca lider tarafından oluşturulabilir." Bu kısıt {@link
 * ClubEventService#create}'te uygulanıyor (bkz. o sınıfın javadoc'u);
 * global bir Spring Security rolü DEĞİL, kulübe özel {@code leaderId}
 * karşılaştırmasıyla — "Kulüp Lideri" {@code auth.Role}'de seed edilen
 * dört rolden biri değil, kulüp bazlı bir atama.
 */
@RestController
@RequestMapping("/api/clubs/events")
public class ClubEventController {

    private final ClubEventService clubEventService;

    public ClubEventController(ClubEventService clubEventService) {
        this.clubEventService = clubEventService;
    }

    @PostMapping
    public ResponseEntity<ClubEventResponse> create(@RequestBody CreateClubEventRequest request) {
        ClubEvent event =
                clubEventService.create(request.clubId(), request.employeeId(), request.name(), request.date());
        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(event));
    }

    @GetMapping
    public List<ClubEventResponse> list(@RequestParam(required = false) Long clubId) {
        return clubEventService.listByClub(clubId).stream().map(ClubEventController::toResponse).toList();
    }

    private static ClubEventResponse toResponse(ClubEvent event) {
        return new ClubEventResponse(event.getId(), event.getClubId(), event.getName(), event.getDate());
    }
}
