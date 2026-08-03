package com.digitalik.attendance.repository;

import com.digitalik.attendance.entity.WorkModel;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WorkModelRepository extends JpaRepository<WorkModel, Long> {
}
