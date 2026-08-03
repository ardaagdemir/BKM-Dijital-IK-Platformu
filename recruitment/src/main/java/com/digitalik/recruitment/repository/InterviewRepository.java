package com.digitalik.recruitment.repository;

import com.digitalik.recruitment.entity.Interview;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InterviewRepository extends JpaRepository<Interview, Long> {

    /** {@code id} ikincil sıralama anahtarı — bkz. {@code CandidateNoteRepository}'deki aynı gerekçe. */
    List<Interview> findByCandidateIdOrderByInterviewDateDescIdDesc(Long candidateId);
}
