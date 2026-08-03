package com.digitalik.attendance.controller;

import com.digitalik.attendance.dto.AttendanceDeviationResponse;
import com.digitalik.attendance.dto.AttendanceRecordRequest;
import com.digitalik.attendance.dto.AttendanceRecordResponse;
import com.digitalik.attendance.dto.ImportAttendanceRecordsRequest;
import com.digitalik.attendance.entity.AttendanceRecord;
import com.digitalik.attendance.service.AttendanceDeviationService;
import com.digitalik.attendance.service.AttendanceRecordService;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * US-07.2.1: PDKS'ten fiili giriş-çıkış verisi — kabul kriteri "test
 * ortamında örnek veri başarıyla okunur/kaydedilir" diyor; roadmap notu
 * (YAGNI) gerçek bir vendor'a özel protokol/adaptör kurulmamasını
 * öngördüğünden, {@code POST} PDKS'in periyodik olarak İTECEĞİ toplu veri
 * paketini kabul eden TEK amaçlı bir uç, {@code GET} ise "okunur" kısmını
 * doğrulayan salt-okuma bir listeleme. Rol kısıtlaması eklenmedi — kabul
 * kriteri bundan bahsetmiyor.
 *
 * <p>US-07.2.2: {@code GET .../deviations}, planlanan vardiya ile fiili
 * giriş-çıkışı karşılaştırıp geç kalma/erken çıkış SAPMASINI listeler (bkz.
 * {@code AttendanceDeviationService} javadoc'u — hiçbir şey kalıcı
 * saklanmaz, her seferinde yeniden hesaplanır).
 */
@RestController
@RequestMapping("/api/attendance/attendance-records")
public class AttendanceRecordController {

    private final AttendanceRecordService attendanceRecordService;
    private final AttendanceDeviationService attendanceDeviationService;

    public AttendanceRecordController(
            AttendanceRecordService attendanceRecordService, AttendanceDeviationService attendanceDeviationService) {
        this.attendanceRecordService = attendanceRecordService;
        this.attendanceDeviationService = attendanceDeviationService;
    }

    @PostMapping
    public ResponseEntity<List<AttendanceRecordResponse>> importRecords(
            @RequestBody ImportAttendanceRecordsRequest request) {
        List<AttendanceRecordService.RecordInput> inputs = request.records() == null
                ? List.of()
                : request.records().stream().map(AttendanceRecordController::toInput).toList();

        List<AttendanceRecord> imported = attendanceRecordService.importRecords(inputs);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(imported.stream().map(AttendanceRecordController::toResponse).toList());
    }

    @GetMapping
    public List<AttendanceRecordResponse> getByEmployee(@RequestParam(required = false) Long employeeId) {
        return attendanceRecordService.getByEmployeeId(employeeId).stream()
                .map(AttendanceRecordController::toResponse)
                .toList();
    }

    @GetMapping("/deviations")
    public List<AttendanceDeviationResponse> getDeviations(@RequestParam(required = false) Long employeeId) {
        return attendanceDeviationService.calculate(employeeId).stream()
                .map(AttendanceRecordController::toDeviationResponse)
                .toList();
    }

    private static AttendanceRecordService.RecordInput toInput(AttendanceRecordRequest request) {
        return new AttendanceRecordService.RecordInput(request.employeeId(), request.checkInAt(), request.checkOutAt());
    }

    private static AttendanceRecordResponse toResponse(AttendanceRecord record) {
        return new AttendanceRecordResponse(
                record.getId(), record.getEmployeeId(), record.getCheckInAt(), record.getCheckOutAt());
    }

    private static AttendanceDeviationResponse toDeviationResponse(AttendanceDeviationService.Deviation deviation) {
        return new AttendanceDeviationResponse(
                deviation.attendanceRecordId(),
                deviation.employeeId(),
                deviation.checkInAt(),
                deviation.checkOutAt(),
                deviation.plannedStartTime(),
                deviation.plannedEndTime(),
                deviation.lateMinutes(),
                deviation.earlyDepartureMinutes());
    }
}
