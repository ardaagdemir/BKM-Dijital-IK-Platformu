package com.digitalik.amenities.service;

import com.digitalik.amenities.entity.ClubMembershipRequest;
import com.digitalik.amenities.entity.ClubMembershipRequestStatus;
import com.digitalik.amenities.exception.ClubMembershipRequestNotFoundException;
import com.digitalik.amenities.exception.ClubNotFoundException;
import com.digitalik.amenities.repository.ClubMembershipRequestRepository;
import com.digitalik.amenities.repository.ClubRepository;
import com.digitalik.core.approval.ApprovalDecisionValidator;
import java.util.List;
import org.springframework.stereotype.Service;

/**
 * US-08G.1.1: Kulüp üyelik talebi oluşturma/karara bağlama —
 * {@code leave.LeaveRequestService}/{@code training.TrainingEnrollmentService}'teki
 * AYNI "talep→onay" deseninin tekrar kullanımı.
 */
@Service
public class ClubMembershipRequestService {

    private final ClubMembershipRequestRepository clubMembershipRequestRepository;
    private final ClubRepository clubRepository;

    public ClubMembershipRequestService(
            ClubMembershipRequestRepository clubMembershipRequestRepository, ClubRepository clubRepository) {
        this.clubMembershipRequestRepository = clubMembershipRequestRepository;
        this.clubRepository = clubRepository;
    }

    public ClubMembershipRequest create(Long clubId, Long employeeId) {
        if (clubId == null) {
            throw new IllegalArgumentException("Kulüp boş olamaz.");
        }
        if (!clubRepository.existsById(clubId)) {
            throw new ClubNotFoundException();
        }
        if (employeeId == null) {
            throw new IllegalArgumentException("Çalışan boş olamaz.");
        }

        return clubMembershipRequestRepository.save(new ClubMembershipRequest(clubId, employeeId));
    }

    /**
     * US-08G.1.1 kabul kriteri: "Talep İK onayına gider." Onaylayan İK
     * olduğundan (Kulüp Lideri DEĞİL) rol/ekip bazlı bir erişim kısıtı
     * uygulanmıyor — {@code travel.ExpenseItemService.decide}'daki AYNI
     * "kabul kriteri istemiyorsa ekleme" kararı.
     */
    public ClubMembershipRequest decide(Long id, ClubMembershipRequestStatus decision, String rejectionReason) {
        ClubMembershipRequest request = clubMembershipRequestRepository
                .findById(id)
                .orElseThrow(ClubMembershipRequestNotFoundException::new);

        ApprovalDecisionValidator.validate(
                request.getStatus(), decision, rejectionReason, "Bu talep zaten karara bağlanmış.");

        if (decision == ClubMembershipRequestStatus.REJECTED) {
            request.reject(rejectionReason);
        } else {
            request.approve();
        }

        return clubMembershipRequestRepository.save(request);
    }

    /**
     * {@code employeeId} verilmezse (İK'nın karara bağlayacağı talebi
     * bulabilmesi için) TÜM talepler döner; verilirse yalnızca o
     * çalışanın talepleri. Rol kısıtlaması eklenmedi — kabul kriteri
     * bundan bahsetmiyor.
     */
    public List<ClubMembershipRequest> list(Long employeeId) {
        return employeeId == null
                ? clubMembershipRequestRepository.findAllByOrderByIdDesc()
                : clubMembershipRequestRepository.findByEmployeeIdOrderByIdDesc(employeeId);
    }
}
