package com.digitalik.platform.approval;

import com.digitalik.core.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

/**
 * US-09.2.1/US-09.2.2: Adı verilen bir onay zincirinin tanımı — kaç adım
 * olduğu ve her adımın gerektirdiği rol {@link ApprovalChainStepDefinition}
 * satırlarında tutulur. Kabul kriteri (US-09.2.2): "Sistem yöneticisi
 * olarak, yeni bir onay zincirini kod yazmadan tanımlamak istiyorum."
 */
@Entity
@Table(name = "approval_chain_definitions")
public class ApprovalChainDefinition extends BaseEntity {

    @Column(nullable = false, unique = true)
    private String name;

    protected ApprovalChainDefinition() {
        // JPA için
    }

    public ApprovalChainDefinition(String name) {
        this.name = name;
    }

    public String getName() {
        return name;
    }
}
