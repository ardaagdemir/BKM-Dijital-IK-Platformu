package com.digitalik.performance.entity;

import com.digitalik.core.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

/**
 * US-06.1.1: Yetkinlik (ad, ağırlık) — bkz. {@link Goal}'daki aynı gerekçe
 * (bilinçli olarak ayrı bir entity, ortak bir "tür" alanına birleştirilmedi).
 */
@Entity
@Table(name = "competencies")
public class Competency extends BaseEntity {

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private Integer weight;

    protected Competency() {
        // JPA için
    }

    public Competency(String name, Integer weight) {
        this.name = name;
        this.weight = weight;
    }

    public void update(String name, Integer weight) {
        this.name = name;
        this.weight = weight;
    }

    public String getName() {
        return name;
    }

    public Integer getWeight() {
        return weight;
    }
}
