package com.digitalik.performance.repository;

import com.digitalik.performance.entity.RatingScale;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RatingScaleRepository extends JpaRepository<RatingScale, Long> {

    /** US-06.1.2: Sistemde her zaman en fazla bir skala olur — bkz. {@code RatingScaleService}. */
    Optional<RatingScale> findFirstByOrderByIdAsc();
}
