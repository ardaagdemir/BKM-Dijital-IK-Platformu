package com.digitalik.organization.repository;

import com.digitalik.organization.entity.EmployeeAsset;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EmployeeAssetRepository extends JpaRepository<EmployeeAsset, Long> {

    List<EmployeeAsset> findByEmployeeIdOrderByDeliveredAtDesc(Long employeeId);
}
