package com.digitalik.performance.controller;

import com.digitalik.performance.dto.FinalScoreResponse;
import com.digitalik.performance.dto.ManagerAssessmentResponse;
import com.digitalik.performance.dto.ManagerAssessmentSummaryResponse;
import com.digitalik.performance.dto.SelfAssessmentScoreRequest;
import com.digitalik.performance.dto.SelfAssessmentScoreResponse;
import com.digitalik.performance.dto.SubmitManagerAssessmentRequest;
import com.digitalik.performance.entity.AssessmentItemType;
import com.digitalik.performance.entity.ManagerAssessment;
import com.digitalik.performance.entity.ManagerAssessmentScore;
import com.digitalik.performance.exception.AssessmentWeightConfigNotFoundException;
import com.digitalik.performance.service.FinalScoreService;
import com.digitalik.performance.service.ManagerAssessmentService;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * US-06.2.2: Yönetici değerlendirmesi — "yönetici yalnızca kendi ekibini
 * değerlendirebilir" kısıtı, {@code organization.TeamController}'daki
 * (US-04.2.2) ve {@code leave}'teki (US-05.3.2) AYNI "istemci taraflı ekip
 * listesi" desenini kullanır: {@code teamEmployeeIds}, çağıran tarafından
 * (frontend, kendi {@code /api/organization/...} sorgusundan) sağlanır —
 * modüller arası Java bağımlılığı olmadığından bu modül kendi başına
 * "bu yöneticinin ekibi kim" sorusunu cevaplayamaz.
 *
 * <p><b>Sadeleştirme:</b> {@code LeaveRequestAccessGuard}/{@code
 * HiringRequestAccessGuard}'ın aksine burada ayrı bir guard {@code @Component}
 * YOK — kontrol edilecek {@code employeeId} zaten istek gövdesinde doğrudan
 * mevcut (var olan bir kaydın repository'den aranması gerekmiyor), bu yüzden
 * doğrudan SpEL ifadesiyle {@code #request.employeeId()} kontrol ediliyor.
 *
 * <p>US-06.3.1: {@code GET} (liste), bir çalışanın geçmiş sonuçlarını
 * "sonuç" (kabul kriterinin bahsettiği asıl anlam) olarak nihai notla
 * ({@code FinalScoreService}, US-06.2.3) birlikte döner. Ağırlıklandırma
 * henüz tanımlanmamışsa o kaleme ait {@code finalScore} sessizce
 * {@code null} bırakılır — liste bir bütün olarak başarısız olmaz.
 */
@RestController
@RequestMapping("/api/performance/manager-assessments")
public class ManagerAssessmentController {

    private final ManagerAssessmentService managerAssessmentService;
    private final FinalScoreService finalScoreService;

    public ManagerAssessmentController(
            ManagerAssessmentService managerAssessmentService, FinalScoreService finalScoreService) {
        this.managerAssessmentService = managerAssessmentService;
        this.finalScoreService = finalScoreService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'IK') or (hasRole('YONETICI') and #teamEmployeeIds != null "
            + "and #teamEmployeeIds.contains(#request.employeeId()))")
    public ResponseEntity<ManagerAssessmentResponse> submit(
            @RequestBody SubmitManagerAssessmentRequest request,
            @RequestParam(required = false) List<Long> teamEmployeeIds) {
        List<ManagerAssessmentService.ScoreInput> scoreInputs = request.scores() == null
                ? List.of()
                : request.scores().stream().map(ManagerAssessmentController::toScoreInput).toList();

        ManagerAssessment managerAssessment =
                managerAssessmentService.submit(request.employeeId(), request.period(), scoreInputs);
        List<ManagerAssessmentScore> scores = managerAssessmentService.getScores(managerAssessment.getId());

        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(managerAssessment, scores));
    }

    /** US-06.3.1: Kabul kriteri bundan bahsetmediğinden rol kısıtlaması eklenmedi. */
    @GetMapping
    public List<ManagerAssessmentSummaryResponse> getByEmployee(@RequestParam(required = false) Long employeeId) {
        return managerAssessmentService.getByEmployeeId(employeeId).stream()
                .map(this::toSummaryResponse)
                .toList();
    }

    /** US-06.2.3: Kabul kriteri bundan bahsetmediğinden rol kısıtlaması eklenmedi. */
    @GetMapping("/{id}/final-score")
    public FinalScoreResponse getFinalScore(@PathVariable Long id) {
        FinalScoreService.FinalScoreResult result = finalScoreService.calculate(id);
        return new FinalScoreResponse(
                id,
                result.goalScore(),
                result.competencyScore(),
                result.goalWeight(),
                result.competencyWeight(),
                result.finalScore());
    }

    private static ManagerAssessmentService.ScoreInput toScoreInput(SelfAssessmentScoreRequest request) {
        AssessmentItemType itemType = parseItemType(request.itemType());
        return new ManagerAssessmentService.ScoreInput(itemType, request.itemId(), request.score());
    }

    private static AssessmentItemType parseItemType(String itemType) {
        try {
            return AssessmentItemType.valueOf(itemType);
        } catch (IllegalArgumentException | NullPointerException ex) {
            throw new IllegalArgumentException("Kalem türü yalnızca GOAL veya COMPETENCY olabilir.");
        }
    }

    private static ManagerAssessmentResponse toResponse(
            ManagerAssessment managerAssessment, List<ManagerAssessmentScore> scores) {
        List<SelfAssessmentScoreResponse> scoreResponses = scores.stream()
                .map(score -> new SelfAssessmentScoreResponse(
                        score.getId(), score.getItemType().name(), score.getItemId(), score.getScore()))
                .toList();
        return new ManagerAssessmentResponse(
                managerAssessment.getId(), managerAssessment.getEmployeeId(), managerAssessment.getPeriod(), scoreResponses);
    }

    private ManagerAssessmentSummaryResponse toSummaryResponse(ManagerAssessment managerAssessment) {
        return new ManagerAssessmentSummaryResponse(
                managerAssessment.getId(),
                managerAssessment.getEmployeeId(),
                managerAssessment.getPeriod(),
                tryCalculateFinalScore(managerAssessment.getId()));
    }

    private Double tryCalculateFinalScore(Long managerAssessmentId) {
        try {
            return finalScoreService.calculate(managerAssessmentId).finalScore();
        } catch (AssessmentWeightConfigNotFoundException ex) {
            return null;
        }
    }
}
