package com.digitalik.leave.controller;

import com.digitalik.leave.dto.LeaveEntitlementResponse;
import com.digitalik.leave.service.LeaveEntitlementService;
import java.time.LocalDate;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * US-04.1.2: İşe giriş tarihinden hesaplanan hizmet yılına göre yıllık izin
 * hak edişi. Saf bir hesaplama ucu — hiçbir kaydı OKUMUYOR/YAZMIYOR (bkz.
 * {@link LeaveEntitlementService}'teki modül-bağımsızlığı notu); çağıran
 * taraf {@code hireDate}'i kendisi sağlar.
 *
 * <p><b>Not:</b> {@code hireDate}, {@code required = false} ile bilinçli
 * olarak İSTEĞE BAĞLI tanımlandı ve boşluğu {@link LeaveEntitlementService}
 * içinde elle doğrulanıyor — {@code required = true} (Spring'in varsayılanı)
 * kullanılsaydı, eksik parametre `MissingServletRequestParameterException`
 * fırlatır ve bu, projede henüz hiçbir modül-özel/platform geneli handler'ı
 * olmadığından {@code core.GlobalExceptionHandler}'ın genel
 * {@code Exception.class} yakalayıcısına düşüp YANLIŞLIKLA 500 dönerdi (canlı
 * test sırasında keşfedildi). Bu, projenin geri kalanında zaten izlenen
 * "doğrulamayı framework'e değil servise bırak" konvansiyonuyla (ör.
 * {@code EmployeeService}'teki elle `IllegalArgumentException` fırlatmaları)
 * tutarlı bir çözüm; {@code GlobalExceptionHandler}'ın framework
 * istisnalarını (ör. {@code ErrorResponseException}) da doğru durum koduyla
 * eşlemesi AYRI, bu story'nin kapsamı dışında bir platform iyileştirmesidir.
 */
@RestController
@RequestMapping("/api/leave/entitlement")
public class LeaveEntitlementController {

    private final LeaveEntitlementService leaveEntitlementService;

    public LeaveEntitlementController(LeaveEntitlementService leaveEntitlementService) {
        this.leaveEntitlementService = leaveEntitlementService;
    }

    @GetMapping
    public LeaveEntitlementResponse calculate(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hireDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate asOfDate) {
        LocalDate effectiveAsOfDate = asOfDate != null ? asOfDate : LocalDate.now();
        var result = leaveEntitlementService.calculate(hireDate, effectiveAsOfDate);
        return new LeaveEntitlementResponse(hireDate, effectiveAsOfDate, result.yearsOfService(), result.entitlementDays());
    }
}
