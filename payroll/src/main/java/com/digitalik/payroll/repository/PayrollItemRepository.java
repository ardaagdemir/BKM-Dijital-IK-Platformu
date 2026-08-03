package com.digitalik.payroll.repository;

import com.digitalik.payroll.entity.PayrollItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PayrollItemRepository extends JpaRepository<PayrollItem, Long> {
}
