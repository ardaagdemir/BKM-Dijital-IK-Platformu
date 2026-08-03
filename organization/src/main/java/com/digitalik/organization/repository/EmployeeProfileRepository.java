package com.digitalik.organization.repository;

import com.digitalik.organization.entity.EmployeeProfile;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EmployeeProfileRepository extends JpaRepository<EmployeeProfile, Long> {

    Optional<EmployeeProfile> findByEmployeeId(Long employeeId);
}
