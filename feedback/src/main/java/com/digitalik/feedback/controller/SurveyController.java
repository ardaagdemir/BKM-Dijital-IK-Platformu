package com.digitalik.feedback.controller;

import com.digitalik.feedback.dto.CreateSurveyRequest;
import com.digitalik.feedback.dto.SurveyOptionResponse;
import com.digitalik.feedback.dto.SurveyOptionResultResponse;
import com.digitalik.feedback.dto.SurveyResponse;
import com.digitalik.feedback.dto.SurveyResultResponse;
import com.digitalik.feedback.entity.Survey;
import com.digitalik.feedback.entity.SurveyOption;
import com.digitalik.feedback.service.SurveyAnswerService;
import com.digitalik.feedback.service.SurveyService;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * US-08E.1.1: Anket oluşturma/listeleme (soru + seçenek listesi) — kabul
 * kriteri yalnızca "Soru+seçenek listesiyle anket oluşturulur" diyor. Rol
 * kısıtlaması eklenmedi — kabul kriteri bundan bahsetmiyor.
 *
 * <p>US-08E.1.3: {@code GET /{id}/results} — seçenek bazlı yüzdesel
 * dağılım (bkz. {@link SurveyAnswerService#getResults}).
 */
@RestController
@RequestMapping("/api/surveys")
public class SurveyController {

    private final SurveyService surveyService;
    private final SurveyAnswerService surveyAnswerService;

    public SurveyController(SurveyService surveyService, SurveyAnswerService surveyAnswerService) {
        this.surveyService = surveyService;
        this.surveyAnswerService = surveyAnswerService;
    }

    @PostMapping
    public ResponseEntity<SurveyResponse> create(@RequestBody CreateSurveyRequest request) {
        Survey survey = surveyService.create(request.question(), request.options(), request.anonymous());
        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(survey));
    }

    @GetMapping
    public List<SurveyResponse> getAll() {
        return surveyService.getAll().stream().map(this::toResponse).toList();
    }

    @GetMapping("/{id}/results")
    public SurveyResultResponse getResults(@PathVariable Long id) {
        SurveyAnswerService.SurveyResults results = surveyAnswerService.getResults(id);
        List<SurveyOptionResultResponse> options = results.options().stream()
                .map(option -> new SurveyOptionResultResponse(
                        option.optionId(), option.optionText(), option.voteCount(), option.percentage()))
                .toList();
        return new SurveyResultResponse(results.surveyId(), results.question(), results.totalResponses(), options);
    }

    private SurveyResponse toResponse(Survey survey) {
        List<SurveyOptionResponse> options = surveyService.getOptions(survey.getId()).stream()
                .map(SurveyController::toOptionResponse)
                .toList();
        return new SurveyResponse(survey.getId(), survey.getQuestion(), options, survey.isAnonymous());
    }

    private static SurveyOptionResponse toOptionResponse(SurveyOption option) {
        return new SurveyOptionResponse(option.getId(), option.getText());
    }
}
