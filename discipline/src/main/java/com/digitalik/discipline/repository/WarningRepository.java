package com.digitalik.discipline.repository;

import com.digitalik.discipline.entity.Warning;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WarningRepository extends JpaRepository<Warning, Long> {

    /** US-08C.1.1: Bir çalışanın uyarıları (en yeni önce) — {@code id DESC} ikincil sıralama (US-03.4.1'deki ders). */
    List<Warning> findByEmployeeIdOrderByDateDescIdDesc(Long employeeId);
}
