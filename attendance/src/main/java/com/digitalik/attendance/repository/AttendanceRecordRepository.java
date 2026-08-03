package com.digitalik.attendance.repository;

import com.digitalik.attendance.entity.AttendanceRecord;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AttendanceRecordRepository extends JpaRepository<AttendanceRecord, Long> {

    /** US-07.2.1: {@code id DESC} ikincil sıralama — aynı anda birden fazla kayıt için belirlilik sağlar. */
    List<AttendanceRecord> findByEmployeeIdOrderByCheckInAtDescIdDesc(Long employeeId);
}
