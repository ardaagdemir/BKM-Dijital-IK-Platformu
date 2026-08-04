package com.digitalik.discipline.service;

import com.digitalik.discipline.entity.Warning;
import com.digitalik.discipline.repository.WarningRepository;
import java.time.LocalDate;
import java.util.List;
import org.springframework.stereotype.Service;

/** US-08C.1.1: Uyarı kaydı oluşturma/listeleme — kabul kriteri yalnızca "Kayıt çalışana bağlanır" diyor. */
@Service
public class WarningService {

    private final WarningRepository warningRepository;

    public WarningService(WarningRepository warningRepository) {
        this.warningRepository = warningRepository;
    }

    public Warning create(Long employeeId, LocalDate date, String reason, String description) {
        if (employeeId == null) {
            throw new IllegalArgumentException("Çalışan boş olamaz.");
        }
        if (date == null) {
            throw new IllegalArgumentException("Tarih boş olamaz.");
        }
        if (reason == null || reason.isBlank()) {
            throw new IllegalArgumentException("Sebep boş olamaz.");
        }
        if (description == null || description.isBlank()) {
            throw new IllegalArgumentException("Açıklama boş olamaz.");
        }

        return warningRepository.save(new Warning(employeeId, date, reason, description));
    }

    /** Rol kısıtlaması eklenmedi — kabul kriteri bundan bahsetmiyor. */
    public List<Warning> listByEmployee(Long employeeId) {
        if (employeeId == null) {
            throw new IllegalArgumentException("Çalışan boş olamaz.");
        }
        return warningRepository.findByEmployeeIdOrderByDateDescIdDesc(employeeId);
    }
}
