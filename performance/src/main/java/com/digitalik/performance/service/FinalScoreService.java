package com.digitalik.performance.service;

import com.digitalik.performance.entity.AssessmentItemType;
import com.digitalik.performance.entity.AssessmentWeightConfig;
import com.digitalik.performance.entity.Competency;
import com.digitalik.performance.entity.Goal;
import com.digitalik.performance.entity.ManagerAssessmentScore;
import com.digitalik.performance.exception.ManagerAssessmentNotFoundException;
import com.digitalik.performance.repository.CompetencyRepository;
import com.digitalik.performance.repository.GoalRepository;
import com.digitalik.performance.repository.ManagerAssessmentRepository;
import com.digitalik.performance.repository.ManagerAssessmentScoreRepository;
import java.util.List;
import org.springframework.stereotype.Service;

/**
 * US-06.2.3: Yetkinlik/hedef puanlarından basit ağırlıklı bir nihai not
 * hesabı. "Sonuç izlenebilir" kabul kriteri, kategori bazlı ara sonuçları da
 * ({@link FinalScoreResult}) döndürerek karşılanıyor — yalnızca tek bir sayı
 * değil, hesaba nasıl varıldığı da görülebiliyor.
 *
 * <p>Her kategori (GOAL/COMPETENCY) için önce, o kategorideki puanlanmış
 * kalemlerin KENDİ ağırlıkları (US-06.1.1'deki {@code Goal}/{@code
 * Competency.weight}) ile ağırlıklı ortalaması alınır; sonra bu iki
 * kategori-ortalaması, {@link AssessmentWeightConfig}'teki (US-06.2.3)
 * PARAMETRİK kategori ağırlıklarıyla birleştirilir. Bir kategoride hiç puan
 * yoksa o kategori hesaba katılmaz (kalan kategorinin ağırlığıyla
 * normalize edilir) — "basit" kalması için eksik kategoriyi sıfır saymak
 * yerine dışlamak tercih edildi.
 */
@Service
public class FinalScoreService {

    private final ManagerAssessmentRepository managerAssessmentRepository;
    private final ManagerAssessmentScoreRepository managerAssessmentScoreRepository;
    private final GoalRepository goalRepository;
    private final CompetencyRepository competencyRepository;
    private final AssessmentWeightConfigService assessmentWeightConfigService;

    public FinalScoreService(
            ManagerAssessmentRepository managerAssessmentRepository,
            ManagerAssessmentScoreRepository managerAssessmentScoreRepository,
            GoalRepository goalRepository,
            CompetencyRepository competencyRepository,
            AssessmentWeightConfigService assessmentWeightConfigService) {
        this.managerAssessmentRepository = managerAssessmentRepository;
        this.managerAssessmentScoreRepository = managerAssessmentScoreRepository;
        this.goalRepository = goalRepository;
        this.competencyRepository = competencyRepository;
        this.assessmentWeightConfigService = assessmentWeightConfigService;
    }

    public FinalScoreResult calculate(Long managerAssessmentId) {
        if (!managerAssessmentRepository.existsById(managerAssessmentId)) {
            throw new ManagerAssessmentNotFoundException();
        }

        List<ManagerAssessmentScore> scores = managerAssessmentScoreRepository.findByManagerAssessmentId(managerAssessmentId);
        Double goalScore = categoryScore(scores, AssessmentItemType.GOAL);
        Double competencyScore = categoryScore(scores, AssessmentItemType.COMPETENCY);
        if (goalScore == null && competencyScore == null) {
            throw new IllegalArgumentException("Nihai not hesaplanamaz: bu değerlendirmede hiç puan yok.");
        }

        AssessmentWeightConfig config = assessmentWeightConfigService.getConfig();
        int goalWeight = config.getGoalWeight();
        int competencyWeight = config.getCompetencyWeight();

        double weightSum = (goalScore != null ? goalWeight : 0) + (competencyScore != null ? competencyWeight : 0);
        double finalScore = ((goalScore != null ? goalScore * goalWeight : 0)
                        + (competencyScore != null ? competencyScore * competencyWeight : 0))
                / weightSum;

        return new FinalScoreResult(goalScore, competencyScore, goalWeight, competencyWeight, finalScore);
    }

    private Double categoryScore(List<ManagerAssessmentScore> scores, AssessmentItemType itemType) {
        List<ManagerAssessmentScore> itemScores =
                scores.stream().filter(score -> score.getItemType() == itemType).toList();
        if (itemScores.isEmpty()) {
            return null;
        }

        double weightedSum = 0;
        double weightTotal = 0;
        for (ManagerAssessmentScore score : itemScores) {
            int itemWeight = itemType == AssessmentItemType.GOAL
                    ? goalRepository.findById(score.getItemId()).map(Goal::getWeight).orElse(0)
                    : competencyRepository.findById(score.getItemId()).map(Competency::getWeight).orElse(0);
            weightedSum += score.getScore() * itemWeight;
            weightTotal += itemWeight;
        }
        return weightTotal == 0 ? null : weightedSum / weightTotal;
    }

    public record FinalScoreResult(
            Double goalScore, Double competencyScore, Integer goalWeight, Integer competencyWeight, Double finalScore) {
    }
}
