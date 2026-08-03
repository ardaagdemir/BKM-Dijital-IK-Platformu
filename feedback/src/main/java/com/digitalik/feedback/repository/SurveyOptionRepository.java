package com.digitalik.feedback.repository;

import com.digitalik.feedback.entity.SurveyOption;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SurveyOptionRepository extends JpaRepository<SurveyOption, Long> {

    /** US-08E.1.1: Bir anketin seçenekleri — eklenme sırasıyla ({@code id ASC}). */
    List<SurveyOption> findBySurveyIdOrderByIdAsc(Long surveyId);
}
