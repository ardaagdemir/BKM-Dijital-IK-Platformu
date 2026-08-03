package com.digitalik.leave.repository;

import com.digitalik.leave.entity.LeaveRequest;
import com.digitalik.leave.entity.LeaveRequestStatus;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, Long> {

    /** US-04.2.3: {@code LeaveBalanceService}'in kullanılan/onay bekleyen gün toplamı için. */
    List<LeaveRequest> findByEmployeeIdAndStatus(Long employeeId, LeaveRequestStatus status);

    /**
     * US-04.2.4: Çalışanın geçmiş/mevcut talepleri, en yeni önce. {@code id}
     * ikincil sıralama anahtarı — {@code startDate} tek başına aynı gün
     * içinde birden fazla talep olduğunda deterministik değil (bkz.
     * {@code organization.EmployeeAssignmentHistoryRepository}'deki aynı
     * canlıda bulunan hata/ders, US-03.4.1).
     */
    List<LeaveRequest> findByEmployeeIdOrderByStartDateDescIdDesc(Long employeeId);
}
