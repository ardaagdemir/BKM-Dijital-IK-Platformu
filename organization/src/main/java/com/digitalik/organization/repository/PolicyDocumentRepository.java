package com.digitalik.organization.repository;

import com.digitalik.organization.entity.PolicyDocument;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PolicyDocumentRepository extends JpaRepository<PolicyDocument, Long> {
}
