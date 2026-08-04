package com.digitalik.attendance.controller;

import com.digitalik.attendance.dto.TimesheetDayResponse;
import com.digitalik.attendance.dto.TimesheetResponse;
import com.digitalik.attendance.service.TimesheetService;
import java.time.LocalDate;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * US-07.3.1: Aylık puantaj (normal/eksik/fazla mesai günleri) — PDKS
 * ({@code AttendanceRecord}) + izin (leave modülü) verisinin birleşimi.
 * {@code leaveDates}, çağıran tarafından (frontend, kendi {@code
 * /api/leave/leave-requests} sorgusundan) sağlanan onaylı izin günleri —
 * bkz. {@code TimesheetService} javadoc'undaki modüller-arası bağımlılık
 * gerekçesi. Rol kısıtlaması eklenmedi — kabul kriteri bundan bahsetmiyor.
 */
@RestController
@RequestMapping("/api/attendance/timesheet")
public class TimesheetController {

    private final TimesheetService timesheetService;

    public TimesheetController(TimesheetService timesheetService) {
        this.timesheetService = timesheetService;
    }

    @GetMapping
    public TimesheetResponse getTimesheet(
            @RequestParam(required = false) Long employeeId,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) List<LocalDate> leaveDates) {
        List<TimesheetDayResponse> days = timesheetService.calculate(employeeId, year, month, leaveDates).stream()
                .map(day -> new TimesheetDayResponse(day.date(), day.status().name(), day.workedMinutes(), day.plannedMinutes()))
                .toList();
        return new TimesheetResponse(employeeId, year, month, days);
    }
}
