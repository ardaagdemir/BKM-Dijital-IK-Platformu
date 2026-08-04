package com.digitalik.leave.service;

import com.digitalik.leave.entity.LeaveRequestStatus;
import com.digitalik.leave.repository.LeaveRequestRepository;
import java.time.LocalDate;
import org.springframework.stereotype.Service;

/**
 * US-04.1.3: İzin bakiyesinin otomatik takibi — {@code bakiye = hak ediş -
 * kullanılan - onay bekleyen}.
 *
 * <p>US-04.2.3: "Kullanılan"/"onay bekleyen" artık {@code LeaveRequest}
 * kayıtları üzerinden GERÇEK bir toplam sorgusu — US-04.1.3'te bu iki alanın
 * neden şimdiye kadar sabit 0 olduğunu açıklayan not ("Bölüm 4.2'de
 * LeaveRequest kaydı eklendiğinde... gerçek bir sorguya dönüşecek") tam
 * olarak burada gerçekleşiyor. Hâlâ hiçbir kalıcı "bakiye" tablosu YOK —
 * bakiye her zaman o anki {@code LeaveRequest} durumlarından TAZE
 * hesaplanıyor (kabul kriterindeki "her işlemde güncellenir" ifadesi bu
 * yüzden ek koda gerek kalmadan otomatik doğru: {@link com.digitalik.leave.service.LeaveRequestService#decide}
 * bir talebi APPROVED yaptığı AN, bir sonraki bakiye sorgusu bunu otomatik
 * yansıtır).
 *
 * <p>"Kullanılan" = {@code APPROVED} taleplerin gün toplamı; "onay bekleyen"
 * = {@code PENDING} taleplerin gün toplamı; {@code REJECTED} hiçbirine
 * dahil değil (doğru davranış — reddedilen izin ne kullanılmış ne bekleyen).
 */
@Service
public class LeaveBalanceService {

    private final LeaveEntitlementService leaveEntitlementService;
    private final LeaveRequestRepository leaveRequestRepository;

    public LeaveBalanceService(
            LeaveEntitlementService leaveEntitlementService, LeaveRequestRepository leaveRequestRepository) {
        this.leaveEntitlementService = leaveEntitlementService;
        this.leaveRequestRepository = leaveRequestRepository;
    }

    public LeaveBalance calculateBalance(Long employeeId, LocalDate hireDate, LocalDate asOfDate) {
        if (employeeId == null) {
            throw new IllegalArgumentException("Çalışan boş olamaz.");
        }

        LeaveEntitlementService.LeaveEntitlement entitlement = leaveEntitlementService.calculate(hireDate, asOfDate);

        int usedDays = sumDays(employeeId, LeaveRequestStatus.APPROVED);
        int pendingDays = sumDays(employeeId, LeaveRequestStatus.PENDING);
        int remainingDays = entitlement.entitlementDays() - usedDays - pendingDays;

        return new LeaveBalance(
                entitlement.yearsOfService(), entitlement.entitlementDays(), usedDays, pendingDays, remainingDays);
    }

    private int sumDays(Long employeeId, LeaveRequestStatus status) {
        return leaveRequestRepository.findByEmployeeIdAndStatus(employeeId, status).stream()
                .mapToInt(request -> (int) request.getRequestedDays())
                .sum();
    }

    public record LeaveBalance(
            long yearsOfService, int entitlementDays, int usedDays, int pendingDays, int remainingDays) {
    }
}
