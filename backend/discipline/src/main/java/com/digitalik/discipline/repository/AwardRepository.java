package com.digitalik.discipline.repository;

import com.digitalik.discipline.entity.Award;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AwardRepository extends JpaRepository<Award, Long> {

    /** US-08C.1.4: Bir çalışanın ödülleri (en yeni önce) — {@code id DESC} ikincil sıralama (US-03.4.1'deki ders). */
    List<Award> findByEmployeeIdOrderByIdDesc(Long employeeId);
}
