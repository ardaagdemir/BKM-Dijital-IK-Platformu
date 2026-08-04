package com.digitalik.payroll.service;

import com.digitalik.attendance.service.TimesheetService;
import com.digitalik.core.export.CsvExporter;
import com.digitalik.leave.entity.LeaveRequest;
import com.digitalik.travel.entity.ExpenseItem;
import java.util.ArrayList;
import java.util.List;
import java.util.function.Function;
import org.springframework.stereotype.Service;

/**
 * US-08D.1.3: Hazırlanan bordro verisini (US-08D.1.2'nin konsolide
 * ekranı) dış bordro sistemine aktarılabilir bir dosya olarak üretme.
 * Kabul kriteri: "Dosya, dış bordro sistemine aktarılabilir formatta
 * üretilir."
 *
 * <p>Sütunlar BİLİNÇLİ OLARAK ham/sayısal ({@code deger} + ayrı {@code
 * birim}) tutuldu — "540 dk" gibi birleşik metin yerine {@code 540} +
 * {@code dakika}, dış sistemin alanı doğrudan sayısal olarak
 * işleyebilmesi için.
 *
 * <p>US-09.4.1: CSV üretimi artık {@code core.export.CsvExporter}'ı
 * kullanıyor (bu servisin eskiden kendi hand-rolled StringBuilder'ının
 * genelleştirildiği bileşen) — üç heterojen kayıt türü (izin/puantaj/masraf)
 * ortak {@code String[]} satır temsiline düzleştirilip TEK bir dışa
 * aktarma çağrısına veriliyor. Dış davranış (endpoint, dosya içeriği)
 * DEĞİŞMEDİ.
 */
@Service
public class PayrollExportService {

    private static final String[] HEADER = {"kayit_turu", "tarih", "aciklama", "deger", "birim"};

    private final PayrollConsolidationService payrollConsolidationService;

    public PayrollExportService(PayrollConsolidationService payrollConsolidationService) {
        this.payrollConsolidationService = payrollConsolidationService;
    }

    public String exportToCsv(Long employeeId, Integer year, Integer month) {
        PayrollConsolidationService.Consolidation consolidation =
                payrollConsolidationService.consolidate(employeeId, year, month);

        List<String[]> rows = new ArrayList<>();

        for (LeaveRequest request : consolidation.approvedLeaveRequests()) {
            rows.add(new String[] {
                "IZIN",
                String.valueOf(request.getStartDate()),
                "Onayli izin (bitis: " + request.getEndDate() + ")",
                String.valueOf(request.getRequestedDays()),
                "gun"
            });
        }

        for (TimesheetService.Day day : consolidation.timesheet()) {
            rows.add(new String[] {
                "PUANTAJ",
                String.valueOf(day.date()),
                String.valueOf(day.status()),
                String.valueOf(day.workedMinutes() == null ? 0 : day.workedMinutes()),
                "dakika"
            });
        }

        for (ExpenseItem item : consolidation.approvedExpenseItems()) {
            rows.add(new String[] {
                "MASRAF", "", "Seyahat talebi #" + item.getTravelRequestId(), String.valueOf(item.getAmount()), "TL"
            });
        }

        return CsvExporter.export(HEADER, rows, Function.identity());
    }
}
