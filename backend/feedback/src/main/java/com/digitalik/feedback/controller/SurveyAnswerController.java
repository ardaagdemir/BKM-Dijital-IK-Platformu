package com.digitalik.feedback.controller;

import com.digitalik.feedback.dto.SubmitSurveyAnswerRequest;
import com.digitalik.feedback.dto.SurveyAnswerResponse;
import com.digitalik.feedback.entity.SurveyAnswer;
import com.digitalik.feedback.service.SurveyAnswerService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * US-08E.1.2: Ankete yanıt verme — kabul kriteri: "Yanıt kaydedilir; anonim
 * seçeneği varsa kullanıcı bilgisi tutulmaz." Rol kısıtlaması eklenmedi —
 * kabul kriteri bundan bahsetmiyor ({@code SurveyController}'daki
 * (US-08E.1.1) AYNI karar).
 */
@RestController
@RequestMapping("/api/surveys/{surveyId}/answers")
public class SurveyAnswerController {

    private final SurveyAnswerService surveyAnswerService;

    public SurveyAnswerController(SurveyAnswerService surveyAnswerService) {
        this.surveyAnswerService = surveyAnswerService;
    }

    @PostMapping
    public ResponseEntity<SurveyAnswerResponse> submit(
            @PathVariable Long surveyId, @RequestBody SubmitSurveyAnswerRequest request) {
        SurveyAnswer answer = surveyAnswerService.submit(surveyId, request.surveyOptionId(), request.employeeId());
        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(answer));
    }

    private static SurveyAnswerResponse toResponse(SurveyAnswer answer) {
        return new SurveyAnswerResponse(
                answer.getId(), answer.getSurveyId(), answer.getSurveyOptionId(), answer.getEmployeeId());
    }
}
