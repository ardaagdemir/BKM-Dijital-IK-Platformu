package com.digitalik.performance.controller;

import com.digitalik.performance.dto.CompetencyResponse;
import com.digitalik.performance.dto.GoalResponse;
import com.digitalik.performance.dto.RatingScaleResponse;
import com.digitalik.performance.dto.SelfAssessmentFormResponse;
import com.digitalik.performance.dto.SelfAssessmentResponse;
import com.digitalik.performance.dto.SelfAssessmentScoreRequest;
import com.digitalik.performance.dto.SelfAssessmentScoreResponse;
import com.digitalik.performance.dto.SubmitSelfAssessmentRequest;
import com.digitalik.performance.entity.AssessmentItemType;
import com.digitalik.performance.entity.Competency;
import com.digitalik.performance.entity.Goal;
import com.digitalik.performance.entity.RatingScale;
import com.digitalik.performance.entity.SelfAssessment;
import com.digitalik.performance.entity.SelfAssessmentScore;
import com.digitalik.performance.service.CompetencyService;
import com.digitalik.performance.service.GoalService;
import com.digitalik.performance.service.RatingScaleService;
import com.digitalik.performance.service.SelfAssessmentService;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * US-06.2.1: Öz değerlendirme — {@code GET /form}, kabul kriterinin kendisi
 * ("Form, tanımlı hedef/yetkinlik setini gösterir") için AÇIKÇA istenen bir
 * bileşen: mevcut hedef/yetkinlik/skala verisini TEK bir yanıtta birleştiriyor
 * (bkz. {@link GoalService}/{@link CompetencyService}/{@link RatingScaleService}
 * kompozisyonu — bu, bu üç servisin kendi sorumluluğunu tekrar etmeyen, salt
 * okuma amaçlı bir toplama). {@code POST}, çalışanın gerçek puanlarını
 * gönderdiği uç.
 *
 * <p>Rol kısıtlaması eklenmedi — kabul kriteri bundan bahsetmiyor.
 */
@RestController
@RequestMapping("/api/performance/self-assessments")
public class SelfAssessmentController {

    private final SelfAssessmentService selfAssessmentService;
    private final GoalService goalService;
    private final CompetencyService competencyService;
    private final RatingScaleService ratingScaleService;

    public SelfAssessmentController(
            SelfAssessmentService selfAssessmentService,
            GoalService goalService,
            CompetencyService competencyService,
            RatingScaleService ratingScaleService) {
        this.selfAssessmentService = selfAssessmentService;
        this.goalService = goalService;
        this.competencyService = competencyService;
        this.ratingScaleService = ratingScaleService;
    }

    @GetMapping("/form")
    public SelfAssessmentFormResponse getForm() {
        List<GoalResponse> goals =
                goalService.getAll().stream().map(SelfAssessmentController::toGoalResponse).toList();
        List<CompetencyResponse> competencies =
                competencyService.getAll().stream().map(SelfAssessmentController::toCompetencyResponse).toList();
        RatingScale scale = ratingScaleService.getScale();
        return new SelfAssessmentFormResponse(goals, competencies, toScaleResponse(scale));
    }

    @PostMapping
    public ResponseEntity<SelfAssessmentResponse> submit(@RequestBody SubmitSelfAssessmentRequest request) {
        List<SelfAssessmentService.ScoreInput> scoreInputs = request.scores() == null
                ? List.of()
                : request.scores().stream().map(SelfAssessmentController::toScoreInput).toList();

        SelfAssessment selfAssessment = selfAssessmentService.submit(request.employeeId(), scoreInputs);
        List<SelfAssessmentScore> scores = selfAssessmentService.getScores(selfAssessment.getId());

        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(selfAssessment, scores));
    }

    private static SelfAssessmentService.ScoreInput toScoreInput(SelfAssessmentScoreRequest request) {
        AssessmentItemType itemType = parseItemType(request.itemType());
        return new SelfAssessmentService.ScoreInput(itemType, request.itemId(), request.score());
    }

    private static AssessmentItemType parseItemType(String itemType) {
        try {
            return AssessmentItemType.valueOf(itemType);
        } catch (IllegalArgumentException | NullPointerException ex) {
            throw new IllegalArgumentException("Kalem türü yalnızca GOAL veya COMPETENCY olabilir.");
        }
    }

    private static SelfAssessmentResponse toResponse(SelfAssessment selfAssessment, List<SelfAssessmentScore> scores) {
        List<SelfAssessmentScoreResponse> scoreResponses = scores.stream()
                .map(score -> new SelfAssessmentScoreResponse(
                        score.getId(), score.getItemType().name(), score.getItemId(), score.getScore()))
                .toList();
        return new SelfAssessmentResponse(selfAssessment.getId(), selfAssessment.getEmployeeId(), scoreResponses);
    }

    private static GoalResponse toGoalResponse(Goal goal) {
        return new GoalResponse(goal.getId(), goal.getName(), goal.getWeight());
    }

    private static CompetencyResponse toCompetencyResponse(Competency competency) {
        return new CompetencyResponse(competency.getId(), competency.getName(), competency.getWeight());
    }

    private static RatingScaleResponse toScaleResponse(RatingScale scale) {
        return new RatingScaleResponse(scale.getId(), scale.getMinValue(), scale.getMaxValue());
    }
}
