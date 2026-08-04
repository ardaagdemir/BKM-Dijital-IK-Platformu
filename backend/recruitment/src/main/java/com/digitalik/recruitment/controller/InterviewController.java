package com.digitalik.recruitment.controller;

import com.digitalik.recruitment.dto.CreateInterviewRequest;
import com.digitalik.recruitment.dto.InterviewResponse;
import com.digitalik.recruitment.entity.Interview;
import com.digitalik.recruitment.service.InterviewService;
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
 * US-05.4.1: Aday mülakat kaydı ekleme/listeleme — çoklu kayıt bir alt
 * kaynak, {@link CandidateNoteController}'daki aynı desen (ayrı controller,
 * {@code CandidateController}'ın büyümesini önlemek için). Rol kısıtlaması
 * eklenmedi — kabul kriteri bundan bahsetmiyor.
 */
@RestController
@RequestMapping("/api/recruitment/candidates/{candidateId}/interviews")
public class InterviewController {

    private final InterviewService interviewService;

    public InterviewController(InterviewService interviewService) {
        this.interviewService = interviewService;
    }

    @PostMapping
    public ResponseEntity<InterviewResponse> create(
            @PathVariable Long candidateId, @RequestBody CreateInterviewRequest request) {
        Interview interview = interviewService.create(
                candidateId, request.interviewDate(), request.participants(), request.result());
        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(interview));
    }

    @GetMapping
    public List<InterviewResponse> list(@PathVariable Long candidateId) {
        return interviewService.listByCandidate(candidateId).stream()
                .map(InterviewController::toResponse)
                .toList();
    }

    private static InterviewResponse toResponse(Interview interview) {
        return new InterviewResponse(
                interview.getId(),
                interview.getCandidateId(),
                interview.getInterviewDate(),
                interview.getParticipants(),
                interview.getResult());
    }
}
