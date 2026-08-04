package com.digitalik.payroll.dto;

import com.digitalik.attendance.dto.TimesheetDayResponse;
import java.util.List;

/** {@code payroll}'ın {@code attendance.dto.TimesheetDayResponse}'u DOĞRUDAN yeniden kullanması, US-08D.1.2'nin bilinçli mimari istisnasının (gerçek Maven bağımlılığı) doğal bir sonucu — ayrı bir kopya DTO icat etmeye gerek yok. */
public record PayrollConsolidationResponse(
        Long employeeId,
        Integer year,
        Integer month,
        List<ApprovedLeaveResponse> approvedLeaveRequests,
        List<TimesheetDayResponse> timesheet,
        List<ApprovedExpenseItemResponse> approvedExpenseItems) {
}
