package com.digitalik.feedback.service;

import com.digitalik.feedback.entity.SuggestionCategory;
import com.digitalik.feedback.exception.SuggestionCategoryNotFoundException;
import com.digitalik.feedback.repository.SuggestionCategoryRepository;
import java.util.List;
import org.springframework.stereotype.Service;

/**
 * US-08F.1.1: Talep/fikir kategorisi için CRUD — {@code
 * organization.JobTitleService}'teki AYNI desen.
 */
@Service
public class SuggestionCategoryService {

    private final SuggestionCategoryRepository suggestionCategoryRepository;

    public SuggestionCategoryService(SuggestionCategoryRepository suggestionCategoryRepository) {
        this.suggestionCategoryRepository = suggestionCategoryRepository;
    }

    public SuggestionCategory create(String name) {
        assertNotBlank(name);
        return suggestionCategoryRepository.save(new SuggestionCategory(name));
    }

    public List<SuggestionCategory> getAll() {
        return suggestionCategoryRepository.findAll();
    }

    public SuggestionCategory update(Long id, String name) {
        assertNotBlank(name);
        SuggestionCategory category =
                suggestionCategoryRepository.findById(id).orElseThrow(SuggestionCategoryNotFoundException::new);
        category.rename(name);
        return suggestionCategoryRepository.save(category);
    }

    public void delete(Long id) {
        if (!suggestionCategoryRepository.existsById(id)) {
            throw new SuggestionCategoryNotFoundException();
        }
        suggestionCategoryRepository.deleteById(id);
    }

    private void assertNotBlank(String name) {
        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("Kategori adı boş olamaz.");
        }
    }
}
