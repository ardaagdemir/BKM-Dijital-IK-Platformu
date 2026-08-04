package com.digitalik.performance.repository;

import com.digitalik.performance.entity.SelfAssessmentScore;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SelfAssessmentScoreRepository extends JpaRepository<SelfAssessmentScore, Long> {

    List<SelfAssessmentScore> findBySelfAssessmentId(Long selfAssessmentId);
}
