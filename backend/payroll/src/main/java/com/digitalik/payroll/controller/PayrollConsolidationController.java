package com.digitalik.payroll.controller;

import com.digitalik.attendance.dto.TimesheetDayResponse;
import com.digitalik.payroll.dto.ApprovedExpenseItemResponse;
import com.digitalik.payroll.dto.ApprovedLeaveResponse;
import com.digitalik.payroll.dto.PayrollConsolidationResponse;
import com.digitalik.payroll.service.PayrollConsolidationService;
import com.digitalik.payroll.service.PayrollExportService;
import java.util.List;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * US-08D.1.2: Onaylanmış izin/PDKS/masraf verisini tek ekranda görme —
 * kabul kriteri: "Ekran, ilgili modüllerden yalnızca onaylanmış kayıtları
 * okur." Rol kısıtlaması eklenmedi — kabul kriteri bundan bahsetmiyor.
 *
 * <p>US-08D.1.3: {@code GET /export} — AYNI konsolide veriyi dış bordro
 * sistemine aktarılabilir bir CSV dosyası olarak döner (bkz. {@link
 * PayrollExportService} javadoc'u).
 */
@RestController
@RequestMapping("/api/payroll/consolidation")
public class PayrollConsolidationController {

    private final PayrollConsolidationService payrollConsolidationService;
    private final PayrollExportService payrollExportService;

    public PayrollConsolidationController(
            PayrollConsolidationService payrollConsolidationService, PayrollExportService payrollExportService) {
        this.payrollConsolidationService = payrollConsolidationService;
        this.payrollExportService = payrollExportService;
    }

    @GetMapping
    public PayrollConsolidationResponse getConsolidation(
            @RequestParam(required = false) Long employeeId,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month) {
        PayrollConsolidationService.Consolidation consolidation =
                payrollConsolidationService.consolidate(employeeId, year, month);

        List<ApprovedLeaveResponse> approvedLeaveRequests = consolidation.approvedLeaveRequests().stream()
                .map(request -> new ApprovedLeaveResponse(
                        request.getId(),
                        request.getLeaveTypeId(),
                        request.getStartDate(),
                        request.getEndDate(),
                        request.getRequestedDays()))
                .toList();

        List<TimesheetDayResponse> timesheet = consolidation.timesheet().stream()
                .map(day -> new TimesheetDayResponse(day.date(), day.status().name(), day.workedMinutes(), day.plannedMinutes()))
                .toList();

        List<ApprovedExpenseItemResponse> approvedExpenseItems = consolidation.approvedExpenseItems().stream()
                .map(item -> new ApprovedExpenseItemResponse(item.getId(), item.getTravelRequestId(), item.getAmount()))
                .toList();

        return new PayrollConsolidationResponse(
                consolidation.employeeId(), year, month, approvedLeaveRequests, timesheet, approvedExpenseItems);
    }

    @GetMapping("/export")
    public ResponseEntity<String> export(
            @RequestParam(required = false) Long employeeId,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month) {
        String csv = payrollExportService.exportToCsv(employeeId, year, month);
        String fileName = "bordro-%d-%d-%d.csv".formatted(employeeId, year, month);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType("text/csv;charset=UTF-8"))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
                .body(csv);
    }
}
