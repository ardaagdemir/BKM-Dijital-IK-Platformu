package com.digitalik.training.entity;

import com.digitalik.core.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

/**
 * US-08A.1.1: Eğitim kataloğu kaydı (ad, tür, süre, sağlayıcı) —
 * {@code attendance.WorkModel}/{@code organization.JobTitle}'daki AYNI
 * bağımsız, tekil referans listesi deseni.
 */
@Entity
@Table(name = "trainings")
public class Training extends BaseEntity {

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String type;

    @Column(nullable = false)
    private Integer durationHours;

    @Column(nullable = false)
    private String provider;

    protected Training() {
        // JPA için
    }

    public Training(String name, String type, Integer durationHours, String provider) {
        this.name = name;
        this.type = type;
        this.durationHours = durationHours;
        this.provider = provider;
    }

    public String getName() {
        return name;
    }

    public String getType() {
        return type;
    }

    public Integer getDurationHours() {
        return durationHours;
    }

    public String getProvider() {
        return provider;
    }

    public void update(String name, String type, Integer durationHours, String provider) {
        this.name = name;
        this.type = type;
        this.durationHours = durationHours;
        this.provider = provider;
    }
}
