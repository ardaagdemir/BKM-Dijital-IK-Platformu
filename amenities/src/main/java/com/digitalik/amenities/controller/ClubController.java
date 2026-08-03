package com.digitalik.amenities.controller;

import com.digitalik.amenities.dto.ClubRequest;
import com.digitalik.amenities.dto.ClubResponse;
import com.digitalik.amenities.entity.Club;
import com.digitalik.amenities.service.ClubService;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * US-08G.1.1: Kulüpleri görüntüleme (+ CRUD, {@code
 * organization.JobTitleController}'daki AYNI desen) — kabul kriterinin
 * gerektirdiği "kulüpleri görüntülemek" için önce bir yerde
 * tanımlanmaları gerekiyor. Rol kısıtlaması eklenmedi — kabul kriteri
 * bundan bahsetmiyor.
 */
@RestController
@RequestMapping("/api/clubs")
public class ClubController {

    private final ClubService clubService;

    public ClubController(ClubService clubService) {
        this.clubService = clubService;
    }

    @PostMapping
    public ResponseEntity<ClubResponse> create(@RequestBody ClubRequest request) {
        Club club = clubService.create(request.name(), request.leaderId());
        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(club));
    }

    @GetMapping
    public List<ClubResponse> getAll() {
        return clubService.getAll().stream().map(ClubController::toResponse).toList();
    }

    @PutMapping("/{id}")
    public ClubResponse update(@PathVariable Long id, @RequestBody ClubRequest request) {
        return toResponse(clubService.update(id, request.name(), request.leaderId()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        clubService.delete(id);
        return ResponseEntity.noContent().build();
    }

    private static ClubResponse toResponse(Club club) {
        return new ClubResponse(club.getId(), club.getName(), club.getLeaderId());
    }
}
