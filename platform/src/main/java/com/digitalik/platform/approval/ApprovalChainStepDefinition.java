package com.digitalik.platform.approval;

import com.digitalik.core.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

/**
 * US-09.2.1/US-09.2.2: Bir {@link ApprovalChainDefinition}'ın adımlarından
 * biri — {@code stepOrder} (1 tabanlı) ve o adımı onaylayabilecek rol.
 */
@Entity
@Table(name = "approval_chain_step_definitions")
public class ApprovalChainStepDefinition extends BaseEntity {

    @Column(nullable = false)
    private Long chainDefinitionId;

    @Column(nullable = false)
    private int stepOrder;

    @Column(nullable = false)
    private String requiredRole;

    protected ApprovalChainStepDefinition() {
        // JPA için
    }

    public ApprovalChainStepDefinition(Long chainDefinitionId, int stepOrder, String requiredRole) {
        this.chainDefinitionId = chainDefinitionId;
        this.stepOrder = stepOrder;
        this.requiredRole = requiredRole;
    }

    public Long getChainDefinitionId() {
        return chainDefinitionId;
    }

    public int getStepOrder() {
        return stepOrder;
    }

    public String getRequiredRole() {
        return requiredRole;
    }
}
