package com.digitalik.organization.repository;

import com.digitalik.organization.entity.EmployeeAssignmentHistory;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EmployeeAssignmentHistoryRepository extends JpaRepository<EmployeeAssignmentHistory, Long> {

    Optional<EmployeeAssignmentHistory> findByEmployeeIdAndEndDateIsNull(Long employeeId);

    /**
     * US-03.4.1: {@code startDate} tek başına aynı gün içinde birden fazla
     * değişiklik olduğunda (ör. bu projenin kendi testlerinde) DETERMİNİSTİK
     * bir sıralama garanti etmiyor — {@code id} ikincil sıralama anahtarı
     * olarak eklendi (büyük id = daha sonra oluşturulan kayıt).
     */
    List<EmployeeAssignmentHistory> findByEmployeeIdOrderByStartDateDescIdDesc(Long employeeId);
}
