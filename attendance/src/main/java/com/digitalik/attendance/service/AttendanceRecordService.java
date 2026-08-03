package com.digitalik.attendance.service;

import com.digitalik.attendance.entity.AttendanceRecord;
import com.digitalik.attendance.repository.AttendanceRecordRepository;
import java.time.OffsetDateTime;
import java.util.List;
import org.springframework.stereotype.Service;

/**
 * US-07.2.1: PDKS'ten alınan fiili giriş-çıkış verisinin içe aktarılması ve
 * geri okunması. Roadmap notu (YAGNI): gerçek bir PDKS vendor'u
 * tanımlanmadığından ({@code Dijital İK Platformu} bir ihale projesi değil),
 * bu servis PDKS'in periyodik olarak İTECEĞİ veri toplu paketini kabul eden
 * TEK amaçlı bir uçtur — genel bir "adaptör çerçevesi" kurulmadı.
 */
@Service
public class AttendanceRecordService {

    private final AttendanceRecordRepository attendanceRecordRepository;

    public AttendanceRecordService(AttendanceRecordRepository attendanceRecordRepository) {
        this.attendanceRecordRepository = attendanceRecordRepository;
    }

    public List<AttendanceRecord> importRecords(List<RecordInput> records) {
        if (records == null || records.isEmpty()) {
            throw new IllegalArgumentException("En az bir kayıt gönderilmelidir.");
        }
        records.forEach(this::validate);

        return records.stream()
                .map(input -> attendanceRecordRepository.save(
                        new AttendanceRecord(input.employeeId(), input.checkInAt(), input.checkOutAt())))
                .toList();
    }

    public List<AttendanceRecord> getByEmployeeId(Long employeeId) {
        if (employeeId == null) {
            throw new IllegalArgumentException("Çalışan boş olamaz.");
        }
        return attendanceRecordRepository.findByEmployeeIdOrderByCheckInAtDescIdDesc(employeeId);
    }

    private void validate(RecordInput input) {
        if (input.employeeId() == null) {
            throw new IllegalArgumentException("Çalışan boş olamaz.");
        }
        if (input.checkInAt() == null) {
            throw new IllegalArgumentException("Giriş zamanı boş olamaz.");
        }
        if (input.checkOutAt() != null && input.checkOutAt().isBefore(input.checkInAt())) {
            throw new IllegalArgumentException("Çıkış zamanı, giriş zamanından önce olamaz.");
        }
    }

    public record RecordInput(Long employeeId, OffsetDateTime checkInAt, OffsetDateTime checkOutAt) {
    }
}
