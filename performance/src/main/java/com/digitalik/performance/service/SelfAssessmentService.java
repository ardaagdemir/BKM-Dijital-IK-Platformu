package com.digitalik.performance.service;

import com.digitalik.performance.entity.AssessmentItemType;
import com.digitalik.performance.entity.RatingScale;
import com.digitalik.performance.entity.SelfAssessment;
import com.digitalik.performance.entity.SelfAssessmentScore;
import com.digitalik.performance.repository.CompetencyRepository;
import com.digitalik.performance.repository.GoalRepository;
import com.digitalik.performance.repository.SelfAssessmentRepository;
import com.digitalik.performance.repository.SelfAssessmentScoreRepository;
import java.util.List;
import org.springframework.stereotype.Service;

/**
 * US-06.2.1: Öz değerlendirme gönderimi — çalışan, tanımlı hedef/yetkinlik
 * setinden seçtiği kalemlere, tanımlı puanlama skalası (US-06.1.2) sınırları
 * içinde puan verir.
 *
 * <p>Kalemlerin TAMAMININ puanlanması ZORUNLU KILINMADI — kabul kriteri
 * yalnızca "Form, tanımlı hedef/yetkinlik setini gösterir" diyor, eksiksiz
 * bir gönderim şartı koşmuyor (YAGNI); yalnızca gönderilen her puanın
 * GERÇEKTEN var olan bir hedef/yetkinliğe ve skala sınırlarına uyduğu
 * doğrulanıyor.
 */
@Service
public class SelfAssessmentService {

    private final SelfAssessmentRepository selfAssessmentRepository;
    private final SelfAssessmentScoreRepository selfAssessmentScoreRepository;
    private final GoalRepository goalRepository;
    private final CompetencyRepository competencyRepository;
    private final RatingScaleService ratingScaleService;

    public SelfAssessmentService(
            SelfAssessmentRepository selfAssessmentRepository,
            SelfAssessmentScoreRepository selfAssessmentScoreRepository,
            GoalRepository goalRepository,
            CompetencyRepository competencyRepository,
            RatingScaleService ratingScaleService) {
        this.selfAssessmentRepository = selfAssessmentRepository;
        this.selfAssessmentScoreRepository = selfAssessmentScoreRepository;
        this.goalRepository = goalRepository;
        this.competencyRepository = competencyRepository;
        this.ratingScaleService = ratingScaleService;
    }

    public SelfAssessment submit(Long employeeId, List<ScoreInput> scoreInputs) {
        if (employeeId == null) {
            throw new IllegalArgumentException("Çalışan boş olamaz.");
        }
        if (scoreInputs == null || scoreInputs.isEmpty()) {
            throw new IllegalArgumentException("En az bir puan girilmelidir.");
        }

        RatingScale scale = ratingScaleService.getScale();
        scoreInputs.forEach(input -> validate(input, scale));

        SelfAssessment selfAssessment = selfAssessmentRepository.save(new SelfAssessment(employeeId));
        scoreInputs.forEach(input -> selfAssessmentScoreRepository.save(new SelfAssessmentScore(
                selfAssessment.getId(), input.itemType(), input.itemId(), input.score())));

        return selfAssessment;
    }

    public List<SelfAssessmentScore> getScores(Long selfAssessmentId) {
        return selfAssessmentScoreRepository.findBySelfAssessmentId(selfAssessmentId);
    }

    private void validate(ScoreInput input, RatingScale scale) {
        if (input.itemType() == null) {
            throw new IllegalArgumentException("Kalem türü yalnızca GOAL veya COMPETENCY olabilir.");
        }
        if (input.itemId() == null) {
            throw new IllegalArgumentException("Kalem id'si boş olamaz.");
        }
        boolean itemExists = input.itemType() == AssessmentItemType.GOAL
                ? goalRepository.existsById(input.itemId())
                : competencyRepository.existsById(input.itemId());
        if (!itemExists) {
            throw new IllegalArgumentException(
                    "Belirtilen %s bulunamadı (id: %d).".formatted(input.itemType(), input.itemId()));
        }
        if (input.score() == null || input.score() < scale.getMinValue() || input.score() > scale.getMaxValue()) {
            throw new IllegalArgumentException(
                    "Puan %d ile %d arasında olmalıdır.".formatted(scale.getMinValue(), scale.getMaxValue()));
        }
    }

    public record ScoreInput(AssessmentItemType itemType, Long itemId, Integer score) {
    }
}
