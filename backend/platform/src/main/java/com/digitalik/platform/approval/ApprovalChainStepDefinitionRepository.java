package com.digitalik.platform.approval;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ApprovalChainStepDefinitionRepository extends JpaRepository<ApprovalChainStepDefinition, Long> {

    List<ApprovalChainStepDefinition> findByChainDefinitionIdOrderByStepOrderAsc(Long chainDefinitionId);

    long countByChainDefinitionId(Long chainDefinitionId);
}
