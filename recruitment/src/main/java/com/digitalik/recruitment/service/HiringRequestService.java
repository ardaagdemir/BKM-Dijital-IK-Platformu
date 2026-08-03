package com.digitalik.recruitment.service;

import com.digitalik.recruitment.entity.HiringRequest;
import com.digitalik.recruitment.entity.HiringRequestStatus;
import com.digitalik.recruitment.exception.HiringRequestNotFoundException;
import com.digitalik.recruitment.exception.StaffingNormNotFoundException;
import com.digitalik.recruitment.repository.HiringRequestRepository;
import com.digitalik.recruitment.repository.StaffingNormRepository;
import org.springframework.stereotype.Service;

/**
 * US-05.3.1: İşe alım talebi oluşturma — kabul kriteri: "Talep formu norm
 * kadro kontrolü yapar; norm yoksa engellenir." Bu kontrol "uyarı gösterir
 * (engellemeyebilir)" diyen {@code leave.LeaveRequestService}'teki bakiye
 * kontrolünden BİLİNÇLİ OLARAK farklı — burada norm yoksa talep GERÇEKTEN
 * reddediliyor (404), oluşturulmuyor.
 *
 * <p>US-05.3.2: İki aşamalı onay — {@link #managerDecide}/{@link #hrDecide}.
 * Talebin gerçekten kararı verenin "kendi biriminde" olup olmadığı
 * YETKİLENDİRME seviyesinde ({@code @PreAuthorize} + {@code HiringRequestAccessGuard})
 * kontrol edilir, burada DEĞİL — bu metotlar yalnızca durum geçişinin
 * kendisinin geçerliliğinden sorumlu (bkz. {@code leave.LeaveRequestService.decide}'daki
 * aynı ayrım).
 */
@Service
public class HiringRequestService {

    private final HiringRequestRepository hiringRequestRepository;
    private final StaffingNormRepository staffingNormRepository;

    public HiringRequestService(
            HiringRequestRepository hiringRequestRepository, StaffingNormRepository staffingNormRepository) {
        this.hiringRequestRepository = hiringRequestRepository;
        this.staffingNormRepository = staffingNormRepository;
    }

    public HiringRequest create(Long organizationUnitId, Long jobTitleId) {
        if (organizationUnitId == null) {
            throw new IllegalArgumentException("Organizasyon birimi boş olamaz.");
        }
        if (jobTitleId == null) {
            throw new IllegalArgumentException("Unvan boş olamaz.");
        }
        if (staffingNormRepository.findByOrganizationUnitIdAndJobTitleId(organizationUnitId, jobTitleId).isEmpty()) {
            throw new StaffingNormNotFoundException();
        }

        return hiringRequestRepository.save(new HiringRequest(organizationUnitId, jobTitleId));
    }

    public HiringRequest managerDecide(Long id, boolean approve) {
        HiringRequest hiringRequest = findOrThrow(id);
        if (hiringRequest.getStatus() != HiringRequestStatus.PENDING) {
            throw new IllegalArgumentException("Bu talep zaten yönetici kararına bağlanmış.");
        }

        if (approve) {
            hiringRequest.approveByManager();
        } else {
            hiringRequest.rejectByManager();
        }
        return hiringRequestRepository.save(hiringRequest);
    }

    public HiringRequest hrDecide(Long id, boolean approve) {
        HiringRequest hiringRequest = findOrThrow(id);
        if (hiringRequest.getStatus() == HiringRequestStatus.PENDING) {
            throw new IllegalArgumentException("Bu talep henüz yönetici onayından geçmedi.");
        }
        if (hiringRequest.getStatus() != HiringRequestStatus.MANAGER_APPROVED) {
            throw new IllegalArgumentException("Bu talep zaten İK kararına bağlanmış.");
        }

        if (approve) {
            hiringRequest.approveByHr();
        } else {
            hiringRequest.rejectByHr();
        }
        return hiringRequestRepository.save(hiringRequest);
    }

    private HiringRequest findOrThrow(Long id) {
        return hiringRequestRepository.findById(id).orElseThrow(HiringRequestNotFoundException::new);
    }
}
