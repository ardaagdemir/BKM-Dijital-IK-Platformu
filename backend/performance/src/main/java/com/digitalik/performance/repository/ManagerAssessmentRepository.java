package com.digitalik.performance.repository;

import com.digitalik.performance.entity.ManagerAssessment;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ManagerAssessmentRepository extends JpaRepository<ManagerAssessment, Long> {

    /** US-06.3.1: "Dönem bazlı liste" — {@code id DESC} ikincil sıralama, aynı dönemdeki kayıtlar için belirlilik sağlar. */
    List<ManagerAssessment> findByEmployeeIdOrderByPeriodDescIdDesc(Long employeeId);
}
