package com.digitalik.feedback.repository;

import com.digitalik.feedback.entity.SuggestionCategory;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SuggestionCategoryRepository extends JpaRepository<SuggestionCategory, Long> {
}
