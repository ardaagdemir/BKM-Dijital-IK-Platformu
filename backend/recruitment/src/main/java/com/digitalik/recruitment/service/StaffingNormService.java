package com.digitalik.recruitment.service;

import com.digitalik.recruitment.entity.StaffingNorm;
import com.digitalik.recruitment.repository.StaffingNormRepository;
import java.util.List;
import org.springframework.stereotype.Service;

/**
 * US-05.1.1: Birim/unvan bazlı norm kadro sayısının tanımlanması (upsert —
 * bkz. {@link #setNorm}, {@code organization.EmployeeProfileService}'teki
 * aynı desen: kayıt yoksa oluşturulur, varsa güncellenir) ve listelenmesi.
 */
@Service
public class StaffingNormService {

    private final StaffingNormRepository staffingNormRepository;

    public StaffingNormService(StaffingNormRepository staffingNormRepository) {
        this.staffingNormRepository = staffingNormRepository;
    }

    public StaffingNorm setNorm(Long organizationUnitId, Long jobTitleId, Integer normCount) {
        if (organizationUnitId == null) {
            throw new IllegalArgumentException("Organizasyon birimi boş olamaz.");
        }
        if (jobTitleId == null) {
            throw new IllegalArgumentException("Unvan boş olamaz.");
        }
        if (normCount == null || normCount < 0) {
            throw new IllegalArgumentException("Norm kadro sayısı negatif olamaz.");
        }

        StaffingNorm staffingNorm = staffingNormRepository
                .findByOrganizationUnitIdAndJobTitleId(organizationUnitId, jobTitleId)
                .orElseGet(() -> new StaffingNorm(organizationUnitId, jobTitleId, normCount));
        staffingNorm.updateNorm(normCount);

        return staffingNormRepository.save(staffingNorm);
    }

    public List<StaffingNorm> getAll() {
        return staffingNormRepository.findAll();
    }
}
