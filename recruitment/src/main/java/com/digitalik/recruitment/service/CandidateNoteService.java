package com.digitalik.recruitment.service;

import com.digitalik.recruitment.entity.CandidateNote;
import com.digitalik.recruitment.exception.CandidateNotFoundException;
import com.digitalik.recruitment.repository.CandidateNoteRepository;
import com.digitalik.recruitment.repository.CandidateRepository;
import java.util.List;
import org.springframework.stereotype.Service;

/**
 * US-05.2.2: Aday profiline not ekleme/listeleme. Notlar salt-ekleme (bkz.
 * {@code CandidateNote}) — güncelleme/silme yok.
 */
@Service
public class CandidateNoteService {

    private final CandidateNoteRepository candidateNoteRepository;
    private final CandidateRepository candidateRepository;

    public CandidateNoteService(
            CandidateNoteRepository candidateNoteRepository, CandidateRepository candidateRepository) {
        this.candidateNoteRepository = candidateNoteRepository;
        this.candidateRepository = candidateRepository;
    }

    public CandidateNote addNote(Long candidateId, String noteText) {
        if (!candidateRepository.existsById(candidateId)) {
            throw new CandidateNotFoundException();
        }
        if (noteText == null || noteText.isBlank()) {
            throw new IllegalArgumentException("Not metni boş olamaz.");
        }

        return candidateNoteRepository.save(new CandidateNote(candidateId, noteText));
    }

    public List<CandidateNote> listByCandidate(Long candidateId) {
        if (!candidateRepository.existsById(candidateId)) {
            throw new CandidateNotFoundException();
        }

        return candidateNoteRepository.findByCandidateIdOrderByIdDesc(candidateId);
    }
}
