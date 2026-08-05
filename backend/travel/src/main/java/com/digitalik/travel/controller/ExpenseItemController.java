package com.digitalik.travel.controller;

import com.digitalik.platform.file.StoredFile;
import com.digitalik.travel.dto.ExpenseItemDecisionRequest;
import com.digitalik.travel.dto.ExpenseItemResponse;
import com.digitalik.travel.entity.ExpenseItem;
import com.digitalik.travel.entity.ExpenseItemStatus;
import com.digitalik.travel.service.ExpenseItemService;
import java.io.IOException;
import java.math.BigDecimal;
import java.util.List;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

/**
 * US-08B.1.2: Masraf kalemi beyanı — {@code recruitment.CandidateController}'daki
 * (US-05.2.1) AYNI {@code multipart/form-data} deseni: belge ({@code
 * document}) ayrı bir dosya olarak gönderilir. Tüm parametreler {@code
 * required = false} — US-04.1.2'deki dersle AYNI gerekçe (eksik zorunlu
 * parametre, özel bir handler olmadan Spring'in kendi istisnasıyla 500'e
 * düşer; doğrulama {@link ExpenseItemService} içinde elle yapılıyor). Rol
 * kısıtlaması eklenmedi — kabul kriteri bundan bahsetmiyor.
 *
 * <p>US-08B.1.3: {@code PUT /{id}/decision} ile onay/ret —
 * {@code leave.LeaveRequestController}'daki AYNI "talep→onay" deseninin
 * tekrar kullanımı; kabul kriteri "yalnızca kendi ekibi" gibi bir kayıt
 * bazlı kısıt İSTEMEDİĞİNDEN (leave/training'in decide uçlarının AKSİNE),
 * burada bir {@code @PreAuthorize}/ekip listesi YOK.
 *
 * <p><b>Bölüm 14.7/8B (frontend) sırasında bulunan boşluk:</b> yüklenen
 * belgenin ham baytlarını İNDİRECEK hiçbir uç yoktu — {@code toResponse}
 * yalnızca meta veriyi ({@code documentFileName}/{@code documentContentType})
 * döndürüyordu, bu da "onaylayacak yönetici belgeyi HİÇ GÖREMEZ" anlamına
 * gelirdi. {@code GET /{id}/document} eklendi —
 * {@code recruitment.CandidateController#downloadCv}'deki (Bölüm 14.4) AYNI
 * desen.
 */
@RestController
@RequestMapping("/api/travel/requests/{travelRequestId}/expense-items")
public class ExpenseItemController {

    private final ExpenseItemService expenseItemService;

    public ExpenseItemController(ExpenseItemService expenseItemService) {
        this.expenseItemService = expenseItemService;
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ExpenseItemResponse> create(
            @PathVariable Long travelRequestId,
            @RequestParam(required = false) BigDecimal amount,
            @RequestPart(value = "document", required = false) MultipartFile document)
            throws IOException {
        byte[] documentData = document != null ? document.getBytes() : null;
        String documentFileName = document != null ? document.getOriginalFilename() : null;
        String documentContentType = document != null ? document.getContentType() : null;

        ExpenseItem expenseItem =
                expenseItemService.create(travelRequestId, amount, documentFileName, documentContentType, documentData);
        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(expenseItem));
    }

    @GetMapping
    public List<ExpenseItemResponse> list(@PathVariable Long travelRequestId) {
        return expenseItemService.listByTravelRequest(travelRequestId).stream()
                .map(this::toResponse)
                .toList();
    }

    @GetMapping("/{id}/document")
    public ResponseEntity<byte[]> downloadDocument(@PathVariable Long travelRequestId, @PathVariable Long id) {
        ExpenseItem expenseItem = expenseItemService.get(id);
        StoredFile document = expenseItemService.getDocument(expenseItem.getStoredFileId());
        String fileName = document.getFileName().replace("\"", "");
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(document.getContentType()))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
                .body(document.getFileData());
    }

    @PutMapping("/{id}/decision")
    public ExpenseItemResponse decide(
            @PathVariable Long travelRequestId, @PathVariable Long id, @RequestBody ExpenseItemDecisionRequest request) {
        ExpenseItemStatus decision = parseDecision(request.decision());
        return toResponse(expenseItemService.decide(id, decision, request.rejectionReason()));
    }

    private static ExpenseItemStatus parseDecision(String decision) {
        try {
            return ExpenseItemStatus.valueOf(decision);
        } catch (IllegalArgumentException | NullPointerException ex) {
            throw new IllegalArgumentException("Karar yalnızca APPROVED veya REJECTED olabilir.");
        }
    }

    /** US-09.7.1: Belge meta verisi artık {@code ExpenseItem} üzerinde değil, {@code StoredFile}'dan okunuyor. */
    private ExpenseItemResponse toResponse(ExpenseItem expenseItem) {
        StoredFile document = expenseItemService.getDocument(expenseItem.getStoredFileId());
        return new ExpenseItemResponse(
                expenseItem.getId(),
                expenseItem.getTravelRequestId(),
                expenseItem.getAmount(),
                document.getFileName(),
                document.getContentType(),
                expenseItem.getStatus().name(),
                expenseItem.getRejectionReason());
    }
}
