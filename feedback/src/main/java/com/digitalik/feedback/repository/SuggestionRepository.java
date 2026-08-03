package com.digitalik.feedback.repository;

import com.digitalik.feedback.entity.Suggestion;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SuggestionRepository extends JpaRepository<Suggestion, Long> {

    /** US-08F.1.1: Bir çalışanın kendi talepleri (en yeni önce) — anonim gönderilenler bu sorguda YER ALMAZ (employeeId yok). */
    List<Suggestion> findByEmployeeIdOrderByIdDesc(Long employeeId);

    /** US-08F.1.2: İK için TÜM talepler (en yeni önce) — durum güncellenecek talebi bulmak için; anonim olanlar dahil. */
    List<Suggestion> findAllByOrderByIdDesc();
}
