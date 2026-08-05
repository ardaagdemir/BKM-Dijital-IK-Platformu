package com.digitalik.recruitment.service;

import com.digitalik.platform.approval.ApprovalChainInstance;
import com.digitalik.platform.approval.ApprovalChainService;
import com.digitalik.recruitment.entity.HiringRequest;
import com.digitalik.recruitment.entity.HiringRequestStatus;
import com.digitalik.recruitment.exception.HiringRequestNotFoundException;
import com.digitalik.recruitment.exception.StaffingNormNotFoundException;
import com.digitalik.recruitment.repository.HiringRequestRepository;
import com.digitalik.recruitment.repository.StaffingNormRepository;
import java.util.List;
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
 *
 * <p>US-09.2.1: Bu sınıfın kendi ön-doğrulama kontrolleri ("Bu talep
 * zaten yönetici kararına bağlanmış." vb.) BİLİNÇLİ OLARAK KORUNDU —
 * dış davranış/hata mesajları hiç değişmedi (roadmap'in "mevcut modüllerin
 * davranışını bozmadan devreye alınır" kriteri). Ön-kontroller geçtikten
 * SONRA, gerçek durum geçişini uygulaması/kaydetmesi için {@link
 * ApprovalChainService#decide}'a delege ediliyor — motor artık bu iki
 * aşamalı akışın GERÇEK, PARALEL kayıt tutan tarafı.
 */
@Service
public class HiringRequestService {

    private static final String APPROVAL_CHAIN_NAME = "hiring-request";
    private static final int MANAGER_STEP = 1;
    private static final int HR_STEP = 2;

    private final HiringRequestRepository hiringRequestRepository;
    private final StaffingNormRepository staffingNormRepository;
    private final ApprovalChainService approvalChainService;

    public HiringRequestService(
            HiringRequestRepository hiringRequestRepository,
            StaffingNormRepository staffingNormRepository,
            ApprovalChainService approvalChainService) {
        this.hiringRequestRepository = hiringRequestRepository;
        this.staffingNormRepository = staffingNormRepository;
        this.approvalChainService = approvalChainService;
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

        // İki aşamalı kayıt: HiringRequest'in kendi id'si, zincir örneği
        // kaydedilmeden ÖNCE bilinmiyor — bu yüzden subjectId burada null,
        // HiringRequest kaydedildikten SONRA assignSubject ile dolduruluyor.
        ApprovalChainInstance chainInstance = approvalChainService.start(APPROVAL_CHAIN_NAME, "HiringRequest", null);
        HiringRequest hiringRequest =
                hiringRequestRepository.save(new HiringRequest(organizationUnitId, jobTitleId, chainInstance.getId()));
        approvalChainService.assignSubject(chainInstance.getId(), hiringRequest.getId());
        return hiringRequest;
    }

    public HiringRequest managerDecide(Long id, boolean approve) {
        HiringRequest hiringRequest = findOrThrow(id);
        if (hiringRequest.getStatus() != HiringRequestStatus.PENDING) {
            throw new IllegalArgumentException("Bu talep zaten yönetici kararına bağlanmış.");
        }

        approvalChainService.decide(hiringRequest.getApprovalChainInstanceId(), MANAGER_STEP, approve);

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

        approvalChainService.decide(hiringRequest.getApprovalChainInstanceId(), HR_STEP, approve);

        if (approve) {
            hiringRequest.approveByHr();
        } else {
            hiringRequest.rejectByHr();
        }
        return hiringRequestRepository.save(hiringRequest);
    }

    /**
     * Bölüm 14.4: {@code /recruitment/hiring-requests} ekranının okuma ucu —
     * {@code organizationUnitId} verilirse (YONETICI kendi biriminin
     * bekleyen taleplerini görür) o birimle sınırlı, verilmezse (İK/ADMIN
     * organizasyon geneli karar verir — bkz. {@link #hrDecide}'daki AYNI
     * kısıt yokluğu) TÜM talepler döner.
     */
    public List<HiringRequest> getAll(Long organizationUnitId) {
        if (organizationUnitId != null) {
            return hiringRequestRepository.findByOrganizationUnitIdOrderByIdDesc(organizationUnitId);
        }
        return hiringRequestRepository.findAllByOrderByIdDesc();
    }

    private HiringRequest findOrThrow(Long id) {
        return hiringRequestRepository.findById(id).orElseThrow(HiringRequestNotFoundException::new);
    }
}
