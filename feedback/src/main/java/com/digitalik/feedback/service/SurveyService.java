package com.digitalik.feedback.service;

import com.digitalik.feedback.entity.Survey;
import com.digitalik.feedback.entity.SurveyOption;
import com.digitalik.feedback.repository.SurveyOptionRepository;
import com.digitalik.feedback.repository.SurveyRepository;
import java.util.List;
import org.springframework.stereotype.Service;

/**
 * US-08E.1.1: Anket oluşturma/listeleme — kabul kriteri "Soru+seçenek
 * listesiyle anket oluşturulur" diyor. En az iki seçenek zorunlu tutuldu —
 * tek seçenekli bir "anket" kabul kriterinin kastettiği "seçenek listesi"
 * ile (ve genel olarak bir oylamanın anlamıyla) çelişir.
 */
@Service
public class SurveyService {

    private final SurveyRepository surveyRepository;
    private final SurveyOptionRepository surveyOptionRepository;

    public SurveyService(SurveyRepository surveyRepository, SurveyOptionRepository surveyOptionRepository) {
        this.surveyRepository = surveyRepository;
        this.surveyOptionRepository = surveyOptionRepository;
    }

    public Survey create(String question, List<String> optionTexts, boolean anonymous) {
        if (question == null || question.isBlank()) {
            throw new IllegalArgumentException("Soru boş olamaz.");
        }
        if (optionTexts == null || optionTexts.size() < 2) {
            throw new IllegalArgumentException("En az iki seçenek gereklidir.");
        }
        if (optionTexts.stream().anyMatch(text -> text == null || text.isBlank())) {
            throw new IllegalArgumentException("Seçenek metni boş olamaz.");
        }

        Survey survey = surveyRepository.save(new Survey(question, anonymous));
        optionTexts.forEach(text -> surveyOptionRepository.save(new SurveyOption(survey.getId(), text)));

        return survey;
    }

    public List<SurveyOption> getOptions(Long surveyId) {
        return surveyOptionRepository.findBySurveyIdOrderByIdAsc(surveyId);
    }

    /** Rol kısıtlaması eklenmedi — kabul kriteri bundan bahsetmiyor. */
    public List<Survey> getAll() {
        return surveyRepository.findAll();
    }
}
