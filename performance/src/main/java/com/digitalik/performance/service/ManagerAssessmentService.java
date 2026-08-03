package com.digitalik.performance.service;

import com.digitalik.performance.entity.AssessmentItemType;
import com.digitalik.performance.entity.ManagerAssessment;
import com.digitalik.performance.entity.ManagerAssessmentScore;
import com.digitalik.performance.entity.RatingScale;
import com.digitalik.performance.repository.CompetencyRepository;
import com.digitalik.performance.repository.GoalRepository;
import com.digitalik.performance.repository.ManagerAssessmentRepository;
import com.digitalik.performance.repository.ManagerAssessmentScoreRepository;
import java.util.List;
import org.springframework.stereotype.Service;

/**
 * US-06.2.2: Yönetici değerlendirmesi gönderimi — {@code SelfAssessmentService}'teki
 * (US-06.2.1) aynı doğrulama mantığı (skala sınırları, kalem varlığı), AYRI
 * kod olarak tekrarlandı (bkz. {@code ManagerAssessment} javadoc'undaki
 * gerekçe). "Yalnızca kendi ekibini değerlendirebilir" kısıtı BURADA DEĞİL,
 * {@code ManagerAssessmentController}'da ({@code @PreAuthorize}) uygulanıyor.
 */
@Service
public class ManagerAssessmentService {

    private final ManagerAssessmentRepository managerAssessmentRepository;
    private final ManagerAssessmentScoreRepository managerAssessmentScoreRepository;
    private final GoalRepository goalRepository;
    private final CompetencyRepository competencyRepository;
    private final RatingScaleService ratingScaleService;

    public ManagerAssessmentService(
            ManagerAssessmentRepository managerAssessmentRepository,
            ManagerAssessmentScoreRepository managerAssessmentScoreRepository,
            GoalRepository goalRepository,
            CompetencyRepository competencyRepository,
            RatingScaleService ratingScaleService) {
        this.managerAssessmentRepository = managerAssessmentRepository;
        this.managerAssessmentScoreRepository = managerAssessmentScoreRepository;
        this.goalRepository = goalRepository;
        this.competencyRepository = competencyRepository;
        this.ratingScaleService = ratingScaleService;
    }

    public ManagerAssessment submit(Long employeeId, String period, List<ScoreInput> scoreInputs) {
        if (employeeId == null) {
            throw new IllegalArgumentException("Çalışan boş olamaz.");
        }
        if (period == null || period.isBlank()) {
            throw new IllegalArgumentException("Dönem boş olamaz.");
        }
        if (scoreInputs == null || scoreInputs.isEmpty()) {
            throw new IllegalArgumentException("En az bir puan girilmelidir.");
        }

        RatingScale scale = ratingScaleService.getScale();
        scoreInputs.forEach(input -> validate(input, scale));

        ManagerAssessment managerAssessment =
                managerAssessmentRepository.save(new ManagerAssessment(employeeId, period));
        scoreInputs.forEach(input -> managerAssessmentScoreRepository.save(new ManagerAssessmentScore(
                managerAssessment.getId(), input.itemType(), input.itemId(), input.score())));

        return managerAssessment;
    }

    public List<ManagerAssessmentScore> getScores(Long managerAssessmentId) {
        return managerAssessmentScoreRepository.findByManagerAssessmentId(managerAssessmentId);
    }

    /** US-06.3.1: Bir çalışanın geçmiş yönetici değerlendirmeleri, dönem bazlı (en yeniden en eskiye). */
    public List<ManagerAssessment> getByEmployeeId(Long employeeId) {
        if (employeeId == null) {
            throw new IllegalArgumentException("Çalışan boş olamaz.");
        }
        return managerAssessmentRepository.findByEmployeeIdOrderByPeriodDescIdDesc(employeeId);
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
