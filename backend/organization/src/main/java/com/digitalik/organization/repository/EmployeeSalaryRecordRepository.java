package com.digitalik.organization.repository;

import com.digitalik.organization.entity.EmployeeSalaryRecord;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EmployeeSalaryRecordRepository extends JpaRepository<EmployeeSalaryRecord, Long> {

    List<EmployeeSalaryRecord> findByEmployeeIdOrderByEffectiveDateDesc(Long employeeId);
}
