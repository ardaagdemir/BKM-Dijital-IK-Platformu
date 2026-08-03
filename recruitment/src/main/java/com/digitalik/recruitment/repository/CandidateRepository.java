package com.digitalik.recruitment.repository;

import com.digitalik.recruitment.entity.Candidate;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CandidateRepository extends JpaRepository<Candidate, Long> {
}
