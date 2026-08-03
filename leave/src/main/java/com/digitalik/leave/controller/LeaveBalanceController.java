package com.digitalik.leave.controller;

import com.digitalik.leave.dto.LeaveBalanceResponse;
import com.digitalik.leave.service.LeaveBalanceService;
import java.time.LocalDate;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * US-04.1.3/US-04.2.3: İzin bakiyesi ({@code hak ediş - kullanılan - onay
 * bekleyen}) — kullanılan/onay bekleyen artık gerçek {@code LeaveRequest}
 * kayıtlarından hesaplanıyor, bu yüzden {@code employeeId} artık zorunlu bir
 * girdi (bakiye çalışana özel). {@code employeeId}/{@code hireDate} yine
 * {@code required = false} işaretli ({@link LeaveEntitlementController}'daki
 * aynı gerekçeyle — eksik parametride framework istisnasının yanlışlıkla
 * 500'e düşmesini önlemek için), boşluk {@link LeaveBalanceService}/
 * {@link com.digitalik.leave.service.LeaveEntitlementService} içinde
 * doğrulanıyor.
 */
@RestController
@RequestMapping("/api/leave/balance")
public class LeaveBalanceController {

    private final LeaveBalanceService leaveBalanceService;

    public LeaveBalanceController(LeaveBalanceService leaveBalanceService) {
        this.leaveBalanceService = leaveBalanceService;
    }

    @GetMapping
    public LeaveBalanceResponse calculate(
            @RequestParam(required = false) Long employeeId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hireDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate asOfDate) {
        LocalDate effectiveAsOfDate = asOfDate != null ? asOfDate : LocalDate.now();
        var balance = leaveBalanceService.calculateBalance(employeeId, hireDate, effectiveAsOfDate);
        return new LeaveBalanceResponse(
                employeeId,
                hireDate,
                effectiveAsOfDate,
                balance.yearsOfService(),
                balance.entitlementDays(),
                balance.usedDays(),
                balance.pendingDays(),
                balance.remainingDays());
    }
}
