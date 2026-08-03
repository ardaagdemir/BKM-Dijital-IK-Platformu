package com.digitalik.organization.repository;

import com.digitalik.organization.entity.OrganizationUnit;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrganizationUnitRepository extends JpaRepository<OrganizationUnit, Long> {
}
