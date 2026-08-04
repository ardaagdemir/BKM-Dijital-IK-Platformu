package com.digitalik.attendance.service;

import com.digitalik.attendance.entity.AttendanceRecord;
import com.digitalik.attendance.entity.WorkModel;
import com.digitalik.attendance.entity.WorkModelAssignment;
import com.digitalik.attendance.exception.WorkModelAssignmentNotFoundException;
import com.digitalik.attendance.exception.WorkModelNotFoundException;
import com.digitalik.attendance.repository.AttendanceRecordRepository;
import com.digitalik.attendance.repository.WorkModelAssignmentRepository;
import com.digitalik.attendance.repository.WorkModelRepository;
import java.time.Duration;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.util.List;
import org.springframework.stereotype.Service;

/**
 * US-07.2.2: Planlanan vardiya (bkz. {@code WorkModelAssignment} →
 * {@link WorkModel#getPlannedStartTime()}/{@link WorkModel#getPlannedEndTime()})
 * ile fiili giriş-çıkışın ({@link AttendanceRecord}) karşılaştırılması —
 * "sapma otomatik hesaplanır" kabul kriteri gereği, hiçbir sapma
 * KALICI OLARAK SAKLANMIYOR ({@code performance.FinalScoreService}'teki
 * (US-06.2.3) AYNI "her seferinde yeniden hesapla, ayrı bir sonuç tablosu
 * açma" deseni) — sonuç her zaman güncel puantaj/atama verisinden türetilir.
 */
@Service
public class AttendanceDeviationService {

    private final AttendanceRecordRepository attendanceRecordRepository;
    private final WorkModelAssignmentRepository workModelAssignmentRepository;
    private final WorkModelRepository workModelRepository;

    public AttendanceDeviationService(
            AttendanceRecordRepository attendanceRecordRepository,
            WorkModelAssignmentRepository workModelAssignmentRepository,
            WorkModelRepository workModelRepository) {
        this.attendanceRecordRepository = attendanceRecordRepository;
        this.workModelAssignmentRepository = workModelAssignmentRepository;
        this.workModelRepository = workModelRepository;
    }

    public List<Deviation> calculate(Long employeeId) {
        if (employeeId == null) {
            throw new IllegalArgumentException("Çalışan boş olamaz.");
        }

        WorkModelAssignment assignment = workModelAssignmentRepository
                .findByEmployeeId(employeeId)
                .orElseThrow(WorkModelAssignmentNotFoundException::new);
        WorkModel workModel = workModelRepository
                .findById(assignment.getWorkModelId())
                .orElseThrow(WorkModelNotFoundException::new);

        List<AttendanceRecord> records = attendanceRecordRepository.findByEmployeeIdOrderByCheckInAtDescIdDesc(employeeId);

        return records.stream().map(record -> toDeviation(record, workModel)).toList();
    }

    private Deviation toDeviation(AttendanceRecord record, WorkModel workModel) {
        LocalTime plannedStart = workModel.getPlannedStartTime();
        LocalTime plannedEnd = workModel.getPlannedEndTime();

        LocalTime actualCheckIn = record.getCheckInAt().atZoneSameInstant(AttendanceZone.REFERENCE).toLocalTime();
        long lateMinutes =
                actualCheckIn.isAfter(plannedStart) ? Duration.between(plannedStart, actualCheckIn).toMinutes() : 0;

        Long earlyDepartureMinutes = null;
        if (record.getCheckOutAt() != null) {
            LocalTime actualCheckOut = record.getCheckOutAt().atZoneSameInstant(AttendanceZone.REFERENCE).toLocalTime();
            earlyDepartureMinutes = actualCheckOut.isBefore(plannedEnd)
                    ? Duration.between(actualCheckOut, plannedEnd).toMinutes()
                    : 0L;
        }

        return new Deviation(
                record.getId(),
                record.getEmployeeId(),
                record.getCheckInAt(),
                record.getCheckOutAt(),
                plannedStart,
                plannedEnd,
                lateMinutes,
                earlyDepartureMinutes);
    }

    public record Deviation(
            Long attendanceRecordId,
            Long employeeId,
            OffsetDateTime checkInAt,
            OffsetDateTime checkOutAt,
            LocalTime plannedStartTime,
            LocalTime plannedEndTime,
            Long lateMinutes,
            Long earlyDepartureMinutes) {
    }
}
