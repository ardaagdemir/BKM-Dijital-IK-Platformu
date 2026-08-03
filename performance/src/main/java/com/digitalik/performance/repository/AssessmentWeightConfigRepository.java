package com.digitalik.performance.repository;

import com.digitalik.performance.entity.AssessmentWeightConfig;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AssessmentWeightConfigRepository extends JpaRepository<AssessmentWeightConfig, Long> {

    /** US-06.2.3: {@code RatingScaleRepository}'deki aynı gerekçe — en fazla bir satır. */
    Optional<AssessmentWeightConfig> findFirstByOrderByIdAsc();
}
