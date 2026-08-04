package com.digitalik.leave.service;

import com.digitalik.core.export.CsvExporter;
import com.digitalik.core.export.ExcelExporter;
import com.digitalik.leave.entity.LeaveRequest;
import org.springframework.stereotype.Service;

/**
 * US-09.4.1: İzin geçmişini CSV/Excel olarak dışa aktarır — roadmap'in
 * kendi örneği ("Çalışan listesi, İzin geçmişi") için {@code core.export}
 * bileşeninin ikinci tüketicisi (bkz. {@code
 * organization.EmployeeExportService}).
 */
@Service
public class LeaveRequestExportService {

    private static final String[] HEADER = {
        "id", "calisan_id", "izin_turu_id", "baslangic", "bitis", "durum", "talep_edilen_gun", "ret_gerekcesi"
    };

    private final LeaveRequestService leaveRequestService;

    public LeaveRequestExportService(LeaveRequestService leaveRequestService) {
        this.leaveRequestService = leaveRequestService;
    }

    public String exportToCsv(Long employeeId) {
        return CsvExporter.export(HEADER, leaveRequestService.listByEmployee(employeeId), LeaveRequestExportService::toRow);
    }

    public byte[] exportToExcel(Long employeeId) {
        return ExcelExporter.export(
                HEADER, leaveRequestService.listByEmployee(employeeId), LeaveRequestExportService::toRow);
    }

    private static String[] toRow(LeaveRequest leaveRequest) {
        return new String[] {
            String.valueOf(leaveRequest.getId()),
            String.valueOf(leaveRequest.getEmployeeId()),
            String.valueOf(leaveRequest.getLeaveTypeId()),
            String.valueOf(leaveRequest.getStartDate()),
            String.valueOf(leaveRequest.getEndDate()),
            leaveRequest.getStatus().name(),
            String.valueOf(leaveRequest.getRequestedDays()),
            String.valueOf(leaveRequest.getRejectionReason())
        };
    }
}
