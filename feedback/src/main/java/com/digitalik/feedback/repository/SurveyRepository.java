package com.digitalik.feedback.repository;

import com.digitalik.feedback.entity.Survey;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SurveyRepository extends JpaRepository<Survey, Long> {
}
