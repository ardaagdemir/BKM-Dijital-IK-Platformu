package com.digitalik.recruitment.security;

import com.digitalik.recruitment.repository.HiringRequestRepository;
import java.util.List;
import org.springframework.stereotype.Component;

/**
 * US-05.3.2: "Yönetici" adımının kayıt bazlı kontrolü —
 * {@code leave.LeaveRequestAccessGuard}'daki (US-04.2.2) AYNI güven-sınırı
 * kararının burada tekrarı: {@code recruitment} modülü {@code organization}'a
 * bağımlı olmadığından "bu birim gerçekten bu yöneticinin sorumluluğunda mı"
 * sorusunu sunucu tarafında doğrulayamıyoruz. Çağıran taraf "yönettiğim
 * birimler" olarak iddia ettiği {@code organizationUnitId} listesini
 * parametre olarak sağlıyor; bu sınıf yalnızca talebin birim id'sinin bu
 * listede olup olmadığını kontrol ediyor.
 */
@Component
public class HiringRequestAccessGuard {

    private final HiringRequestRepository hiringRequestRepository;

    public HiringRequestAccessGuard(HiringRequestRepository hiringRequestRepository) {
        this.hiringRequestRepository = hiringRequestRepository;
    }

    public boolean isOwnUnit(Long hiringRequestId, List<Long> teamOrganizationUnitIds) {
        if (hiringRequestId == null || teamOrganizationUnitIds == null || teamOrganizationUnitIds.isEmpty()) {
            return false;
        }

        return hiringRequestRepository
                .findById(hiringRequestId)
                .map(request -> teamOrganizationUnitIds.contains(request.getOrganizationUnitId()))
                .orElse(false);
    }
}
