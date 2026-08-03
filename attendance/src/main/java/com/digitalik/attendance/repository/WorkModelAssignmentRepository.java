package com.digitalik.attendance.repository;

import com.digitalik.attendance.entity.WorkModelAssignment;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WorkModelAssignmentRepository extends JpaRepository<WorkModelAssignment, Long> {

    /** US-07.1.2: Bir çalışanın en fazla bir güncel ataması olur — bkz. {@code WorkModelAssignmentService}. */
    Optional<WorkModelAssignment> findByEmployeeId(Long employeeId);
}
