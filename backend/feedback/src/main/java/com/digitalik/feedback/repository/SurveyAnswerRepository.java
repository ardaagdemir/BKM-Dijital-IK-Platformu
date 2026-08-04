package com.digitalik.feedback.repository;

import com.digitalik.feedback.entity.SurveyAnswer;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SurveyAnswerRepository extends JpaRepository<SurveyAnswer, Long> {

    /** US-08E.1.3: Bir ankete verilen TÜM yanıtlar — sonuçların seçenek bazlı yüzdesini hesaplamak için. */
    List<SurveyAnswer> findBySurveyId(Long surveyId);
}
