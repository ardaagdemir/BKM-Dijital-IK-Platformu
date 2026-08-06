package com.digitalik.organization.controller;

import com.digitalik.organization.dto.PolicyDocumentResponse;
import com.digitalik.organization.entity.PolicyDocument;
import com.digitalik.organization.service.PolicyDocumentService;
import java.io.IOException;
import java.util.List;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

/**
 * US-08I.1.1: Politika dokümanı yükleme/versiyonlama (+ listeleme) —
 * kabul kriteri: "Yeni versiyon eskisini arşivler." Dosya, {@code
 * recruitment.CandidateController}'daki (US-05.2.1) AYNI desen:
 * {@code multipart/form-data}, tüm parametreler {@code required = false}
 * + servis seviyesinde elle doğrulama (US-04.1.2'deki ders). Rol
 * kısıtlaması eklenmedi — kabul kriteri bundan bahsetmiyor.
 */
@RestController
@RequestMapping("/api/documents")
public class PolicyDocumentController {

    private final PolicyDocumentService policyDocumentService;

    public PolicyDocumentController(PolicyDocumentService policyDocumentService) {
        this.policyDocumentService = policyDocumentService;
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<PolicyDocumentResponse> upload(
            @RequestParam(required = false) String title,
            @RequestParam(required = false) Long previousVersionId,
            @RequestPart(value = "file", required = false) MultipartFile file)
            throws IOException {
        byte[] documentData = file != null ? file.getBytes() : null;
        String fileName = file != null ? file.getOriginalFilename() : null;
        String contentType = file != null ? file.getContentType() : null;

        PolicyDocument document =
                policyDocumentService.upload(title, fileName, contentType, documentData, previousVersionId);
        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(document));
    }

    @GetMapping
    public List<PolicyDocumentResponse> getAll() {
        return policyDocumentService.getAll().stream().map(PolicyDocumentController::toResponse).toList();
    }

    // `travel.ExpenseItemController#downloadDocument`'teki AYNI desen —
    // sibling uçlarla (upload/getAll) AYNI rol duruşu: kısıtlama YOK.
    @GetMapping("/{id}/document")
    public ResponseEntity<byte[]> downloadDocument(@PathVariable Long id) {
        PolicyDocument document = policyDocumentService.getById(id);
        String fileName = document.getFileName().replace("\"", "");
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(document.getContentType()))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
                .body(document.getDocumentData());
    }

    private static PolicyDocumentResponse toResponse(PolicyDocument document) {
        return new PolicyDocumentResponse(
                document.getId(),
                document.getTitle(),
                document.getVersion(),
                document.getFileName(),
                document.getStatus().name(),
                document.getPreviousVersionId());
    }
}
