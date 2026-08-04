package com.digitalik.performance.repository;

import com.digitalik.performance.entity.SelfAssessment;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SelfAssessmentRepository extends JpaRepository<SelfAssessment, Long> {
}
