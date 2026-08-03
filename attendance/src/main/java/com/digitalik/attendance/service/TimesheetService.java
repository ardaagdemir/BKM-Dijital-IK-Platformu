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
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;

/**
 * US-07.3.1: Aylık puantaj — PDKS verisi ({@link AttendanceRecord}, US-07.2.1)
 * ile izin verisinin (leave modülü, US-04.2.3) birleşimi.
 *
 * <p>{@code attendance}, {@code leave}'e Java bağımlılığı olmadığından
 * (modüller arası bağımlılık yok kuralı) onaylı izin günleri,
 * {@code organization.TeamController}'daki (US-04.2.2) AYNI "istemci
 * taraflı liste" desenle çağıran tarafından ({@code leaveDates}) sağlanır —
 * çağıran (frontend), kendi {@code /api/leave/leave-requests} sorgusundan
 * elde ettiği onaylı izin günlerini buraya iletir.
 *
 * <p>Sonuç HİÇBİR YERDE KALICI SAKLANMIYOR — {@code FinalScoreService}
 * (performance, US-06.2.3) ve {@code AttendanceDeviationService}'teki
 * (US-07.2.2) AYNI "her seferinde güncel veriden yeniden hesapla" deseni.
 */
@Service
public class TimesheetService {

    private final AttendanceRecordRepository attendanceRecordRepository;
    private final WorkModelAssignmentRepository workModelAssignmentRepository;
    private final WorkModelRepository workModelRepository;

    public TimesheetService(
            AttendanceRecordRepository attendanceRecordRepository,
            WorkModelAssignmentRepository workModelAssignmentRepository,
            WorkModelRepository workModelRepository) {
        this.attendanceRecordRepository = attendanceRecordRepository;
        this.workModelAssignmentRepository = workModelAssignmentRepository;
        this.workModelRepository = workModelRepository;
    }

    public List<Day> calculate(Long employeeId, Integer year, Integer month, List<LocalDate> leaveDates) {
        if (employeeId == null) {
            throw new IllegalArgumentException("Çalışan boş olamaz.");
        }
        if (year == null || month == null) {
            throw new IllegalArgumentException("Yıl ve ay boş olamaz.");
        }
        if (month < 1 || month > 12) {
            throw new IllegalArgumentException("Ay 1 ile 12 arasında olmalıdır.");
        }

        WorkModelAssignment assignment = workModelAssignmentRepository
                .findByEmployeeId(employeeId)
                .orElseThrow(WorkModelAssignmentNotFoundException::new);
        WorkModel workModel =
                workModelRepository.findById(assignment.getWorkModelId()).orElseThrow(WorkModelNotFoundException::new);
        long plannedMinutes =
                Duration.between(workModel.getPlannedStartTime(), workModel.getPlannedEndTime()).toMinutes();

        Set<LocalDate> leaveDaySet = leaveDates == null ? Set.of() : new HashSet<>(leaveDates);
        YearMonth yearMonth = YearMonth.of(year, month);
        Map<LocalDate, Long> workedMinutesByDay = workedMinutesByDay(employeeId, yearMonth);

        List<Day> days = new ArrayList<>();
        for (int dayOfMonth = 1; dayOfMonth <= yearMonth.lengthOfMonth(); dayOfMonth++) {
            LocalDate date = yearMonth.atDay(dayOfMonth);
            if (leaveDaySet.contains(date)) {
                days.add(new Day(date, Status.IZINLI, null, (int) plannedMinutes));
                continue;
            }

            long workedMinutes = workedMinutesByDay.getOrDefault(date, 0L);
            Status status;
            if (workedMinutes < plannedMinutes) {
                status = Status.EKSIK;
            } else if (workedMinutes > plannedMinutes) {
                status = Status.FAZLA_MESAI;
            } else {
                status = Status.NORMAL;
            }
            days.add(new Day(date, status, (int) workedMinutes, (int) plannedMinutes));
        }
        return days;
    }

    /** Yalnızca ÇIKIŞI OLAN kayıtlar sayılıyor — çıkışsız bir kayıttan gerçek çalışma süresi bilinemez. */
    private Map<LocalDate, Long> workedMinutesByDay(Long employeeId, YearMonth yearMonth) {
        return attendanceRecordRepository.findByEmployeeIdOrderByCheckInAtDescIdDesc(employeeId).stream()
                .filter(record -> record.getCheckOutAt() != null)
                .filter(record -> yearMonth.equals(YearMonth.from(localDateOf(record))))
                .collect(Collectors.groupingBy(
                        this::localDateOf,
                        Collectors.summingLong(record ->
                                Duration.between(record.getCheckInAt(), record.getCheckOutAt()).toMinutes())));
    }

    private LocalDate localDateOf(AttendanceRecord record) {
        return record.getCheckInAt().atZoneSameInstant(AttendanceZone.REFERENCE).toLocalDate();
    }

    public enum Status {
        NORMAL,
        EKSIK,
        FAZLA_MESAI,
        IZINLI
    }

    public record Day(LocalDate date, Status status, Integer workedMinutes, Integer plannedMinutes) {
    }
}
