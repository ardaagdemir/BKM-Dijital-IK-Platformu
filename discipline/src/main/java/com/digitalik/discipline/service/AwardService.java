package com.digitalik.discipline.service;

import com.digitalik.discipline.entity.Award;
import com.digitalik.discipline.repository.AwardRepository;
import java.util.List;
import org.springframework.stereotype.Service;

/** US-08C.1.4: Ödül kaydı oluşturma/listeleme — kabul kriteri yalnızca "Kayıt çalışana bağlanır" diyor. */
@Service
public class AwardService {

    private final AwardRepository awardRepository;

    public AwardService(AwardRepository awardRepository) {
        this.awardRepository = awardRepository;
    }

    public Award create(Long employeeId, String type, String description) {
        if (employeeId == null) {
            throw new IllegalArgumentException("Çalışan boş olamaz.");
        }
        if (type == null || type.isBlank()) {
            throw new IllegalArgumentException("Ödül türü boş olamaz.");
        }
        if (description == null || description.isBlank()) {
            throw new IllegalArgumentException("Açıklama boş olamaz.");
        }

        return awardRepository.save(new Award(employeeId, type, description));
    }

    /** Rol kısıtlaması eklenmedi — kabul kriteri bundan bahsetmiyor. */
    public List<Award> listByEmployee(Long employeeId) {
        if (employeeId == null) {
            throw new IllegalArgumentException("Çalışan boş olamaz.");
        }
        return awardRepository.findByEmployeeIdOrderByIdDesc(employeeId);
    }
}
