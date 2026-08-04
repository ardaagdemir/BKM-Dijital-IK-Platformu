package com.digitalik.platform.approval;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ApprovalChainDefinitionRepository extends JpaRepository<ApprovalChainDefinition, Long> {

    Optional<ApprovalChainDefinition> findByName(String name);
}
