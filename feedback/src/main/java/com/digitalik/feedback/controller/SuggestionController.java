package com.digitalik.feedback.controller;

import com.digitalik.feedback.dto.CreateSuggestionRequest;
import com.digitalik.feedback.dto.SuggestionResponse;
import com.digitalik.feedback.dto.UpdateSuggestionStatusRequest;
import com.digitalik.feedback.entity.Suggestion;
import com.digitalik.feedback.service.SuggestionService;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * US-08F.1.1: Talep/fikir gönderme (kategori seçip, opsiyonel anonim) —
 * kabul kriteri: "Kategori basit bir referans listesidir; anonim seçeneği
 * desteklenir." Rol kısıtlaması eklenmedi — kabul kriteri bundan
 * bahsetmiyor.
 *
 * <p>US-08F.1.2: {@code PUT /{id}/status} — talebin durumunu günceller;
 * {@code GET}'teki {@code employeeId} parametresi artık İSTEĞE BAĞLI —
 * verilmezse İK'nın güncelleyecek talebi bulabilmesi için TÜM talepler
 * (anonim dahil) döner.
 */
@RestController
@RequestMapping("/api/suggestions")
public class SuggestionController {

    private final SuggestionService suggestionService;

    public SuggestionController(SuggestionService suggestionService) {
        this.suggestionService = suggestionService;
    }

    @PostMapping
    public ResponseEntity<SuggestionResponse> create(@RequestBody CreateSuggestionRequest request) {
        Suggestion suggestion = suggestionService.create(
                request.categoryId(), request.description(), request.employeeId(), request.anonymous());
        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(suggestion));
    }

    @GetMapping
    public List<SuggestionResponse> list(@RequestParam(required = false) Long employeeId) {
        return suggestionService.list(employeeId).stream().map(SuggestionController::toResponse).toList();
    }

    @PutMapping("/{id}/status")
    public SuggestionResponse updateStatus(@PathVariable Long id, @RequestBody UpdateSuggestionStatusRequest request) {
        return toResponse(suggestionService.updateStatus(id, request.status()));
    }

    private static SuggestionResponse toResponse(Suggestion suggestion) {
        return new SuggestionResponse(
                suggestion.getId(),
                suggestion.getCategoryId(),
                suggestion.getEmployeeId(),
                suggestion.getDescription(),
                suggestion.getStatus());
    }
}
