package com.digitalik.travel.repository;

import com.digitalik.travel.entity.TravelRequest;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TravelRequestRepository extends JpaRepository<TravelRequest, Long> {

    /** US-08B.1.1: Bir çalışanın seyahat talepleri (en yeni önce) — {@code id DESC} ikincil sıralama (US-03.4.1'deki ders). */
    List<TravelRequest> findByEmployeeIdOrderByStartDateDescIdDesc(Long employeeId);
}
