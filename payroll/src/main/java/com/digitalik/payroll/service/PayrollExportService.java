package com.digitalik.payroll.service;

import com.digitalik.attendance.service.TimesheetService;
import com.digitalik.leave.entity.LeaveRequest;
import com.digitalik.travel.entity.ExpenseItem;
import org.springframework.stereotype.Service;

/**
 * US-08D.1.3: Hazırlanan bordro verisini (US-08D.1.2'nin konsolide
 * ekranı) dış bordro sistemine aktarılabilir bir dosya olarak üretme.
 * Kabul kriteri: "Dosya, dış bordro sistemine aktarılabilir formatta
 * üretilir."
 *
 * <p><b>CSV seçildi, Excel DEĞİL</b> — FR-1113 "Excel/CSV/API/dosya
 * bazlı/PDF" zenginliğinin en basit, hiçbir yeni kütüphane bağımlılığı
 * (ör. Apache POI) gerektirmeyen üyesi; CSV zaten evrensel olarak "dış
 * sisteme aktarılabilir" kabul edilir ve kabul kriteri belirli bir format
 * İSTEMİYOR.
 *
 * <p>Sütunlar BİLİNÇLİ OLARAK ham/sayısal ({@code deger} + ayrı {@code
 * birim}) tutuldu — "540 dk" gibi birleşik metin yerine {@code 540} +
 * {@code dakika}, dış sistemin alanı doğrudan sayısal olarak
 * işleyebilmesi için.
 */
@Service
public class PayrollExportService {

    private static final String HEADER = "kayit_turu,tarih,aciklama,deger,birim";

    private final PayrollConsolidationService payrollConsolidationService;

    public PayrollExportService(PayrollConsolidationService payrollConsolidationService) {
        this.payrollConsolidationService = payrollConsolidationService;
    }

    public String exportToCsv(Long employeeId, Integer year, Integer month) {
        PayrollConsolidationService.Consolidation consolidation =
                payrollConsolidationService.consolidate(employeeId, year, month);

        StringBuilder csv = new StringBuilder(HEADER).append('\n');

        for (LeaveRequest request : consolidation.approvedLeaveRequests()) {
            csv.append("IZIN,")
                    .append(request.getStartDate())
                    .append(",Onayli izin (bitis: ")
                    .append(request.getEndDate())
                    .append("),")
                    .append(request.getRequestedDays())
                    .append(",gun\n");
        }

        for (TimesheetService.Day day : consolidation.timesheet()) {
            csv.append("PUANTAJ,")
                    .append(day.date())
                    .append(',')
                    .append(day.status())
                    .append(',')
                    .append(day.workedMinutes() == null ? 0 : day.workedMinutes())
                    .append(",dakika\n");
        }

        for (ExpenseItem item : consolidation.approvedExpenseItems()) {
            csv.append("MASRAF,,Seyahat talebi #")
                    .append(item.getTravelRequestId())
                    .append(',')
                    .append(item.getAmount())
                    .append(",TL\n");
        }

        return csv.toString();
    }
}
