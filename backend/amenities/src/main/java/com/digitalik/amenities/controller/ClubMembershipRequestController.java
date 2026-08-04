package com.digitalik.amenities.controller;

import com.digitalik.amenities.dto.ClubMembershipDecisionRequest;
import com.digitalik.amenities.dto.ClubMembershipRequestResponse;
import com.digitalik.amenities.dto.CreateClubMembershipRequestRequest;
import com.digitalik.amenities.entity.ClubMembershipRequest;
import com.digitalik.amenities.entity.ClubMembershipRequestStatus;
import com.digitalik.amenities.service.ClubMembershipRequestService;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * US-08G.1.1: Kulüp üyelik talebi oluşturma/karara bağlama — kabul
 * kriteri: "Talep İK onayına gider." Rol kısıtlaması eklenmedi (bkz.
 * {@code ClubMembershipRequestService.decide} javadoc'u).
 */
@RestController
@RequestMapping("/api/clubs/membership-requests")
public class ClubMembershipRequestController {

    private final ClubMembershipRequestService clubMembershipRequestService;

    public ClubMembershipRequestController(ClubMembershipRequestService clubMembershipRequestService) {
        this.clubMembershipRequestService = clubMembershipRequestService;
    }

    @PostMapping
    public ResponseEntity<ClubMembershipRequestResponse> create(@RequestBody CreateClubMembershipRequestRequest request) {
        ClubMembershipRequest membershipRequest =
                clubMembershipRequestService.create(request.clubId(), request.employeeId());
        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(membershipRequest));
    }

    @GetMapping
    public List<ClubMembershipRequestResponse> list(@RequestParam(required = false) Long employeeId) {
        return clubMembershipRequestService.list(employeeId).stream()
                .map(ClubMembershipRequestController::toResponse)
                .toList();
    }

    @PutMapping("/{id}/decision")
    public ClubMembershipRequestResponse decide(
            @PathVariable Long id, @RequestBody ClubMembershipDecisionRequest request) {
        ClubMembershipRequestStatus decision = parseStatus(request.status());
        return toResponse(clubMembershipRequestService.decide(id, decision, request.rejectionReason()));
    }

    private static ClubMembershipRequestStatus parseStatus(String status) {
        try {
            return ClubMembershipRequestStatus.valueOf(status);
        } catch (IllegalArgumentException | NullPointerException ex) {
            throw new IllegalArgumentException("Karar yalnızca APPROVED veya REJECTED olabilir.");
        }
    }

    private static ClubMembershipRequestResponse toResponse(ClubMembershipRequest request) {
        return new ClubMembershipRequestResponse(
                request.getId(), request.getClubId(), request.getEmployeeId(), request.getStatus(),
                request.getRejectionReason());
    }
}
