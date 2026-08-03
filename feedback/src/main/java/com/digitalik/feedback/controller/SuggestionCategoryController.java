package com.digitalik.feedback.controller;

import com.digitalik.feedback.dto.SuggestionCategoryRequest;
import com.digitalik.feedback.dto.SuggestionCategoryResponse;
import com.digitalik.feedback.entity.SuggestionCategory;
import com.digitalik.feedback.service.SuggestionCategoryService;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * US-08F.1.1: Talep/fikir kategorisi CRUD ekranı — {@code
 * organization.JobTitleController}'daki AYNI desen. Rol kısıtlaması
 * eklenmedi — kabul kriteri bundan bahsetmiyor.
 */
@RestController
@RequestMapping("/api/suggestions/categories")
public class SuggestionCategoryController {

    private final SuggestionCategoryService suggestionCategoryService;

    public SuggestionCategoryController(SuggestionCategoryService suggestionCategoryService) {
        this.suggestionCategoryService = suggestionCategoryService;
    }

    @PostMapping
    public ResponseEntity<SuggestionCategoryResponse> create(@RequestBody SuggestionCategoryRequest request) {
        SuggestionCategory category = suggestionCategoryService.create(request.name());
        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(category));
    }

    @GetMapping
    public List<SuggestionCategoryResponse> getAll() {
        return suggestionCategoryService.getAll().stream()
                .map(SuggestionCategoryController::toResponse)
                .toList();
    }

    @PutMapping("/{id}")
    public SuggestionCategoryResponse update(@PathVariable Long id, @RequestBody SuggestionCategoryRequest request) {
        return toResponse(suggestionCategoryService.update(id, request.name()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        suggestionCategoryService.delete(id);
        return ResponseEntity.noContent().build();
    }

    private static SuggestionCategoryResponse toResponse(SuggestionCategory category) {
        return new SuggestionCategoryResponse(category.getId(), category.getName());
    }
}
