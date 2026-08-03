package com.digitalik.performance.service;

import com.digitalik.performance.entity.RatingScale;
import com.digitalik.performance.exception.RatingScaleNotFoundException;
import com.digitalik.performance.repository.RatingScaleRepository;
import org.springframework.stereotype.Service;

/**
 * US-06.1.2: Puanlama skalası (ör. 1-5) tanımlama/görüntüleme — upsert
 * (kayıt yoksa oluşturulur, varsa güncellenir; bkz. {@code RatingScale}
 * javadoc'u).
 */
@Service
public class RatingScaleService {

    private final RatingScaleRepository ratingScaleRepository;

    public RatingScaleService(RatingScaleRepository ratingScaleRepository) {
        this.ratingScaleRepository = ratingScaleRepository;
    }

    public RatingScale setScale(Integer minValue, Integer maxValue) {
        if (minValue == null || maxValue == null) {
            throw new IllegalArgumentException("Alt ve üst sınır boş olamaz.");
        }
        if (minValue < 1) {
            throw new IllegalArgumentException("Alt sınır 1'den küçük olamaz.");
        }
        if (maxValue <= minValue) {
            throw new IllegalArgumentException("Üst sınır, alt sınırdan büyük olmalıdır.");
        }

        RatingScale ratingScale =
                ratingScaleRepository.findFirstByOrderByIdAsc().orElseGet(() -> new RatingScale(minValue, maxValue));
        ratingScale.update(minValue, maxValue);

        return ratingScaleRepository.save(ratingScale);
    }

    public RatingScale getScale() {
        return ratingScaleRepository.findFirstByOrderByIdAsc().orElseThrow(RatingScaleNotFoundException::new);
    }
}
