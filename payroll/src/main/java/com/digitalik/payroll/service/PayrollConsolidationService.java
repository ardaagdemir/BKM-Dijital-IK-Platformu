package com.digitalik.payroll.service;

import com.digitalik.attendance.exception.WorkModelAssignmentNotFoundException;
import com.digitalik.attendance.exception.WorkModelNotFoundException;
import com.digitalik.attendance.service.TimesheetService;
import com.digitalik.leave.entity.LeaveRequest;
import com.digitalik.leave.entity.LeaveRequestStatus;
import com.digitalik.leave.repository.LeaveRequestRepository;
import com.digitalik.travel.entity.ExpenseItem;
import com.digitalik.travel.entity.ExpenseItemStatus;
import com.digitalik.travel.entity.TravelRequest;
import com.digitalik.travel.repository.ExpenseItemRepository;
import com.digitalik.travel.repository.TravelRequestRepository;
import java.time.LocalDate;
import java.util.List;
import org.springframework.stereotype.Service;

/**
 * US-08D.1.2: Onaylanmış izin/PDKS/masraf verisini tek ekranda görme.
 * Kabul kriteri: "Ekran, ilgili modüllerden yalnızca onaylanmış kayıtları
 * okur."
 *
 * <p><b>Mimari not:</b> Bu, projede {@code payroll}'ın {@code
 * leave}/{@code attendance}/{@code travel}'a GERÇEK bir Maven
 * bağımlılığı kurduğu İLK story — kullanıcıyla birlikte değerlendirilip
 * onaylanan, bilinçli bir istisna (bkz. implementation log'daki "Bölüm
 * 9.2 kısmi sadeleştirmesi"nden sonraki tartışma). Diğer 16 modülün
 * "yalnızca core'a bağımlı" kuralı BURADA kasıtlı olarak ihlal edildi —
 * bağımlılık TEK YÖNLÜ (yalnızca {@code payroll} bağımlı olur, tersi
 * değil); roadmap bu modülü zaten "onaylanmış veriyi okuyan bir
 * tüketici" olarak tanımlıyor.
 */
@Service
public class PayrollConsolidationService {

    private final LeaveRequestRepository leaveRequestRepository;
    private final TravelRequestRepository travelRequestRepository;
    private final ExpenseItemRepository expenseItemRepository;
    private final TimesheetService timesheetService;

    public PayrollConsolidationService(
            LeaveRequestRepository leaveRequestRepository,
            TravelRequestRepository travelRequestRepository,
            ExpenseItemRepository expenseItemRepository,
            TimesheetService timesheetService) {
        this.leaveRequestRepository = leaveRequestRepository;
        this.travelRequestRepository = travelRequestRepository;
        this.expenseItemRepository = expenseItemRepository;
        this.timesheetService = timesheetService;
    }

    public Consolidation consolidate(Long employeeId, Integer year, Integer month) {
        if (employeeId == null) {
            throw new IllegalArgumentException("Çalışan boş olamaz.");
        }
        if (year == null || month == null) {
            throw new IllegalArgumentException("Yıl ve ay boş olamaz.");
        }

        List<LeaveRequest> approvedLeaveRequests =
                leaveRequestRepository.findByEmployeeIdAndStatus(employeeId, LeaveRequestStatus.APPROVED);

        // US-07.3.1'de attendance/leave arasında "istemci taraflı liste" ile
        // çözülen ihtiyaç — burada payroll HER İKİSİNE de gerçek erişimi
        // olduğundan onaylı izin günlerini KENDİSİ hesaplayıp puantaja veriyor.
        List<LocalDate> leaveDates = approvedLeaveRequests.stream()
                .flatMap(request -> request.getStartDate().datesUntil(request.getEndDate().plusDays(1)))
                .toList();

        List<TimesheetService.Day> timesheet = calculateTimesheet(employeeId, year, month, leaveDates);

        List<ExpenseItem> approvedExpenseItems = travelRequestRepository
                .findByEmployeeIdOrderByStartDateDescIdDesc(employeeId)
                .stream()
                .map(TravelRequest::getId)
                .flatMap(travelRequestId ->
                        expenseItemRepository.findByTravelRequestIdOrderByIdDesc(travelRequestId).stream())
                .filter(item -> item.getStatus() == ExpenseItemStatus.APPROVED)
                .toList();

        return new Consolidation(employeeId, approvedLeaveRequests, timesheet, approvedExpenseItems);
    }

    /**
     * Çalışana henüz bir çalışma modeli/atama tanımlanmamışsa puantaj
     * kısmı BOŞ döner — bu, ekranın geri kalanını (onaylı izin/masraf)
     * engelleyen bir HATA değil, yalnızca henüz mevcut olmayan bir veri
     * parçası.
     */
    private List<TimesheetService.Day> calculateTimesheet(
            Long employeeId, Integer year, Integer month, List<LocalDate> leaveDates) {
        try {
            return timesheetService.calculate(employeeId, year, month, leaveDates);
        } catch (WorkModelAssignmentNotFoundException | WorkModelNotFoundException ex) {
            return List.of();
        }
    }

    public record Consolidation(
            Long employeeId,
            List<LeaveRequest> approvedLeaveRequests,
            List<TimesheetService.Day> timesheet,
            List<ExpenseItem> approvedExpenseItems) {
    }
}
