package com.digitalik.recruitment.controller;

import com.digitalik.recruitment.dto.CandidateNoteRequest;
import com.digitalik.recruitment.dto.CandidateNoteResponse;
import com.digitalik.recruitment.entity.CandidateNote;
import com.digitalik.recruitment.service.CandidateNoteService;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * US-05.2.2: Aday profiline not ekleme/listeleme — çoklu kayıt bir alt
 * kaynak, bu yüzden {@link CandidateController}'dan ayrı (bkz. o sınıftaki
 * gerekçe). Rol kısıtlaması eklenmedi — kabul kriteri bundan bahsetmiyor.
 */
@RestController
@RequestMapping("/api/recruitment/candidates/{candidateId}/notes")
public class CandidateNoteController {

    private final CandidateNoteService candidateNoteService;

    public CandidateNoteController(CandidateNoteService candidateNoteService) {
        this.candidateNoteService = candidateNoteService;
    }

    @PostMapping
    public ResponseEntity<CandidateNoteResponse> addNote(
            @PathVariable Long candidateId, @RequestBody CandidateNoteRequest request) {
        CandidateNote note = candidateNoteService.addNote(candidateId, request.noteText());
        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(note));
    }

    @GetMapping
    public List<CandidateNoteResponse> list(@PathVariable Long candidateId) {
        return candidateNoteService.listByCandidate(candidateId).stream()
                .map(CandidateNoteController::toResponse)
                .toList();
    }

    private static CandidateNoteResponse toResponse(CandidateNote note) {
        return new CandidateNoteResponse(note.getId(), note.getCandidateId(), note.getNoteText());
    }
}
