package com.digitalik.feedback.entity;

import com.digitalik.core.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

/**
 * US-08F.1.1: Talep/fikir kategorisi — {@code organization.JobTitle}'daki
 * AYNI minimal desen: tek başına yönetilen, basit bir referans listesi.
 * Kabul kriteri: "Kategori basit bir referans listesidir." FR-801'in örnek
 * kategorileri (süreç iyileştirme, teknoloji/sistem geliştirme, ...) seed
 * data olarak taşınmadı — kabul kriteri {@code auth.Role}'ün (US-02.2.1)
 * AKSİNE "hazır gelir" demiyor.
 */
@Entity
@Table(name = "suggestion_categories")
public class SuggestionCategory extends BaseEntity {

    @Column(nullable = false)
    private String name;

    protected SuggestionCategory() {
        // JPA için
    }

    public SuggestionCategory(String name) {
        this.name = name;
    }

    public String getName() {
        return name;
    }

    public void rename(String name) {
        this.name = name;
    }
}
