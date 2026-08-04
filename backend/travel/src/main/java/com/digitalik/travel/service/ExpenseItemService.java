package com.digitalik.travel.service;

import com.digitalik.core.approval.ApprovalDecisionValidator;
import com.digitalik.platform.file.FileStorageService;
import com.digitalik.platform.file.StoredFile;
import com.digitalik.travel.entity.ExpenseItem;
import com.digitalik.travel.entity.ExpenseItemStatus;
import com.digitalik.travel.exception.ExpenseItemNotFoundException;
import com.digitalik.travel.exception.TravelRequestNotFoundException;
import com.digitalik.travel.repository.ExpenseItemRepository;
import com.digitalik.travel.repository.TravelRequestRepository;
import java.math.BigDecimal;
import java.util.List;
import org.springframework.stereotype.Service;

/**
 * US-08B.1.2: Masraf kalemi beyanı (tutar + belge) — kabul kriteri "Her kalem tutar+belge ile kaydedilir" diyor.
 *
 * <p>US-09.7.1: Belge, {@code platform.file.FileStorageService} üzerinden
 * {@code StoredFile} olarak saklanıyor — bkz. {@code ExpenseItem}'ın javadoc'u.
 */
@Service
public class ExpenseItemService {

    private final ExpenseItemRepository expenseItemRepository;
    private final TravelRequestRepository travelRequestRepository;
    private final FileStorageService fileStorageService;

    public ExpenseItemService(
            ExpenseItemRepository expenseItemRepository,
            TravelRequestRepository travelRequestRepository,
            FileStorageService fileStorageService) {
        this.expenseItemRepository = expenseItemRepository;
        this.travelRequestRepository = travelRequestRepository;
        this.fileStorageService = fileStorageService;
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

        StoredFile storedFile = fileStorageService.store(documentFileName, documentContentType, documentData);
        return expenseItemRepository.save(new ExpenseItem(travelRequestId, amount, storedFile.getId()));
    }

    /** US-09.7.1: {@code ExpenseItem} artık belge meta verisini tutmuyor — görüntüleme için {@code StoredFile}'dan okunur. */
    public StoredFile getDocument(Long storedFileId) {
        return fileStorageService.retrieve(storedFileId);
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
