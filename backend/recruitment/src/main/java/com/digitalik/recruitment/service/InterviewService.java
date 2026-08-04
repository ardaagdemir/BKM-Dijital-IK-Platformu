package com.digitalik.recruitment.service;

import com.digitalik.recruitment.entity.Interview;
import com.digitalik.recruitment.exception.CandidateNotFoundException;
import com.digitalik.recruitment.repository.CandidateRepository;
import com.digitalik.recruitment.repository.InterviewRepository;
import java.time.LocalDate;
import java.util.List;
import org.springframework.stereotype.Service;

/**
 * US-05.4.1: Aday mülakat kaydı oluşturma/listeleme — kabul kriteri:
 * "Mülakat kaydı adayla ilişkilendirilir."
 */
@Service
public class InterviewService {

    private final InterviewRepository interviewRepository;
    private final CandidateRepository candidateRepository;

    public InterviewService(InterviewRepository interviewRepository, CandidateRepository candidateRepository) {
        this.interviewRepository = interviewRepository;
        this.candidateRepository = candidateRepository;
    }

    public Interview create(Long candidateId, LocalDate interviewDate, String participants, String result) {
        if (!candidateRepository.existsById(candidateId)) {
            throw new CandidateNotFoundException();
        }
        if (interviewDate == null) {
            throw new IllegalArgumentException("Mülakat tarihi boş olamaz.");
        }
        assertNotBlank(participants, "Katılımcılar boş olamaz.");
        assertNotBlank(result, "Sonuç boş olamaz.");

        return interviewRepository.save(new Interview(candidateId, interviewDate, participants, result));
    }

    public List<Interview> listByCandidate(Long candidateId) {
        if (!candidateRepository.existsById(candidateId)) {
            throw new CandidateNotFoundException();
        }

        return interviewRepository.findByCandidateIdOrderByInterviewDateDescIdDesc(candidateId);
    }

    private void assertNotBlank(String value, String message) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(message);
        }
    }
}
