package com.digitalik.organization.repository;

import com.digitalik.organization.entity.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

/**
 * US-03.2.3: {@link JpaSpecificationExecutor}, isim/birim/unvan filtrelerinin
 * (yalnızca verilenlerin) birleştirilebilir şekilde uygulanmasını sağlar —
 * bkz. {@link EmployeeSpecifications}.
 */
public interface EmployeeRepository extends JpaRepository<Employee, Long>, JpaSpecificationExecutor<Employee> {

    boolean existsByNationalId(String nationalId);

    /** US-03.2.5: Güncellemede, TC No değişmediyse kendi kaydıyla çakışma sayılmamalı. */
    boolean existsByNationalIdAndIdNot(String nationalId, Long id);
}
