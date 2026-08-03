package com.digitalik.travel.service;

import com.digitalik.core.approval.ApprovalDecisionValidator;
import com.digitalik.travel.entity.ExpenseItem;
import com.digitalik.travel.entity.ExpenseItemStatus;
import com.digitalik.travel.exception.ExpenseItemNotFoundException;
import com.digitalik.travel.exception.TravelRequestNotFoundException;
import com.digitalik.travel.repository.ExpenseItemRepository;
import com.digitalik.travel.repository.TravelRequestRepository;
import java.math.BigDecimal;
import java.util.List;
import org.springframework.stereotype.Service;

/** US-08B.1.2: Masraf kalemi beyanı (tutar + belge) — kabul kriteri "Her kalem tutar+belge ile kaydedilir" diyor. */
@Service
public class ExpenseItemService {

    private final ExpenseItemRepository expenseItemRepository;
    private final TravelRequestRepository travelRequestRepository;

    public ExpenseItemService(
            ExpenseItemRepository expenseItemRepository, TravelRequestRepository travelRequestRepository) {
        this.expenseItemRepository = expenseItemRepository;
        this.travelRequestRepository = travelRequestRepository;
    }

    public ExpenseItem create(
            Long travelRequestId,
            BigDecimal amount,
            String documentFileName,
            String documentContentType,
            byte[] documentData) {
        if (travelRequestId == null) {
            throw new IllegalArgumentException("Seyahat talebi boş olamaz.");
        }
        if (!travelRequestRepository.existsById(travelRequestId)) {
            throw new TravelRequestNotFoundException();
        }
        if (amount == null || amount.signum() <= 0) {
            throw new IllegalArgumentException("Tutar sıfırdan büyük olmalıdır.");
        }
        if (documentData == null || documentData.length == 0) {
            throw new IllegalArgumentException("Belge boş olamaz.");
        }

        return expenseItemRepository.save(
                new ExpenseItem(travelRequestId, amount, documentFileName, documentContentType, documentData));
    }

    public List<ExpenseItem> listByTravelRequest(Long travelRequestId) {
        if (travelRequestId == null) {
            throw new IllegalArgumentException("Seyahat talebi boş olamaz.");
        }
        if (!travelRequestRepository.existsById(travelRequestId)) {
            throw new TravelRequestNotFoundException();
        }
        return expenseItemRepository.findByTravelRequestIdOrderByIdDesc(travelRequestId);
    }

    /**
     * US-08B.1.3: Onay/ret — kabul kriteri "Basit onay adımı; ret gerekçesi
     * zorunlu" diyor; {@code leave.LeaveRequestService.decide}'daki AYNI
     * kural: yalnızca {@code PENDING} bir kalem karara bağlanabilir,
     * {@code REJECTED} için gerekçe zorunlu. Kabul kriteri "yalnızca kendi
     * ekibi" gibi bir kayıt bazlı kısıt İSTEMEDİĞİNDEN (leave/training'teki
     * onay uçlarının AKSİNE), rol kısıtlaması da eklenmedi.
     */
    public ExpenseItem decide(Long id, ExpenseItemStatus decision, String rejectionReason) {
        ExpenseItem expenseItem = expenseItemRepository.findById(id).orElseThrow(ExpenseItemNotFoundException::new);

        ApprovalDecisionValidator.validate(
                expenseItem.getStatus(), decision, rejectionReason, "Bu kalem zaten karara bağlanmış.");

        if (decision == ExpenseItemStatus.REJECTED) {
            expenseItem.reject(rejectionReason);
        } else {
            expenseItem.approve();
        }

        return expenseItemRepository.save(expenseItem);
    }
}
