package com.digitalik.performance.entity;

import com.digitalik.core.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

/**
 * US-06.1.1: Hedef (ad, ağırlık) — {@code organization.JobTitle}'daki aynı
 * desenle basit bir referans listesi. {@link Competency} ile AYNI şekle
 * sahip olmasına rağmen BİLİNÇLİ OLARAK ayrı bir entity/tablo — tıpkı
 * {@code organization.OrganizationUnit}/{@code JobTitle}'ın (roadmap Bölüm
 * 3.1) tek bir "tür" alanlı ortak tabloya birleştirilmemesi gibi; bu
 * projenin tutarlı bir konvansiyonu.
 */
@Entity
@Table(name = "goals")
public class Goal extends BaseEntity {

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private Integer weight;

    protected Goal() {
        // JPA için
    }

    public Goal(String name, Integer weight) {
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
