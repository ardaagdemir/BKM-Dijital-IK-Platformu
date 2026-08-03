package com.digitalik.organization.entity;

import com.digitalik.core.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

/**
 * US-03.1.2: Görev/Unvan — {@link OrganizationUnit} hiyerarşisinden bağımsız,
 * tek başına yönetilen bir referans listesi (kabul kriteri gereği).
 */
@Entity
@Table(name = "job_titles")
public class JobTitle extends BaseEntity {

    @Column(nullable = false)
    private String name;

    protected JobTitle() {
        // JPA için
    }

    public JobTitle(String name) {
        this.name = name;
    }

    public String getName() {
        return name;
    }

    public void rename(String name) {
        this.name = name;
    }
}
