package com.digitalik.recruitment.repository;

import com.digitalik.recruitment.entity.CandidateNote;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CandidateNoteRepository extends JpaRepository<CandidateNote, Long> {

    List<CandidateNote> findByCandidateIdOrderByIdDesc(Long candidateId);
}
