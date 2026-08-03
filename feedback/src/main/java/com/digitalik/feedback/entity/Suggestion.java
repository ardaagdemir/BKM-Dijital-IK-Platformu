package com.digitalik.feedback.entity;

import com.digitalik.core.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;

/**
 * US-08F.1.1: Bir çalışanın gönderdiği talep/fikir. Kabul kriteri: "Kategori
 * basit bir referans listesidir; anonim seçeneği desteklenir."
 *
 * <p>{@code employeeId} NULLABLE — FR-800'ün "opsiyonel anonim gönderim"
 * ihtiyacı için. {@code SuggestionService.create}, istemci anonim seçtiğinde
 * bu alanı BİLİNÇLİ OLARAK {@code null} bırakır (istemci bir {@code
 * employeeId} göndermiş olsa BİLE) — {@code survey.SurveyAnswer}'daki
 * (US-08E.1.2) AYNI "tutulmaz demek, veri hiç yazılmaz demektir" gerekçesi.
 * Ayrı bir {@code anonymous} sütunu YOK — {@code employeeId == null} zaten
 * tek başına anonimliğin kanıtı (başka hiçbir yolla null olamaz).
 *
 * <p>{@code categoryId}, AYNI modül içindeki {@link SuggestionCategory}'e
 * normal bir FK ile bağlıdır.
 *
 * <p>US-08F.1.2: {@code status} (V51) — `PENDING` ile oluşturulur, {@link
 * #updateStatus(SuggestionStatus)} ile İK tarafından güncellenir. Kabul
 * kriteri geçiş kısıtlaması (ör. "yalnızca bekleyen bir talep... ") İSTEMEDİĞİNDEN
 * herhangi bir durumdan herhangi bir duruma serbestçe geçilebilir.
 */
@Entity
@Table(name = "suggestions")
public class Suggestion extends BaseEntity {

    @Column(nullable = false)
    private Long categoryId;

    private Long employeeId;

    @Column(nullable = false)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SuggestionStatus status;

    protected Suggestion() {
        // JPA için
    }

    public Suggestion(Long categoryId, Long employeeId, String description) {
        this.categoryId = categoryId;
        this.employeeId = employeeId;
        this.description = description;
        this.status = SuggestionStatus.PENDING;
    }

    public void updateStatus(SuggestionStatus status) {
        this.status = status;
    }

    public Long getCategoryId() {
        return categoryId;
    }

    public Long getEmployeeId() {
        return employeeId;
    }

    public String getDescription() {
        return description;
    }

    public SuggestionStatus getStatus() {
        return status;
    }
}
