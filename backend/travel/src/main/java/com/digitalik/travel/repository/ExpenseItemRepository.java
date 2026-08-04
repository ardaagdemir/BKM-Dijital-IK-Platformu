package com.digitalik.travel.repository;

import com.digitalik.travel.entity.ExpenseItem;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ExpenseItemRepository extends JpaRepository<ExpenseItem, Long> {

    /** US-08B.1.2: Bir seyahat talebine bağlı masraf kalemleri (en yeni önce). */
    List<ExpenseItem> findByTravelRequestIdOrderByIdDesc(Long travelRequestId);
}
