package com.digitalik.recruitment.repository;

import com.digitalik.recruitment.entity.Candidate;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CandidateRepository extends JpaRepository<Candidate, Long> {

    /** Bölüm 14.4: aday listesi, en yeni başvuru önce. */
    List<Candidate> findAllByOrderByIdDesc();
}
