package com.digitalik.performance.repository;

import com.digitalik.performance.entity.ManagerAssessmentScore;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ManagerAssessmentScoreRepository extends JpaRepository<ManagerAssessmentScore, Long> {

    List<ManagerAssessmentScore> findByManagerAssessmentId(Long managerAssessmentId);
}
