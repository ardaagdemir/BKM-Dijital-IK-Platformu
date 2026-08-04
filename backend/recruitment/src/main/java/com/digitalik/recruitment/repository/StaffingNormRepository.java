package com.digitalik.recruitment.repository;

import com.digitalik.recruitment.entity.StaffingNorm;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StaffingNormRepository extends JpaRepository<StaffingNorm, Long> {

    Optional<StaffingNorm> findByOrganizationUnitIdAndJobTitleId(Long organizationUnitId, Long jobTitleId);
}
