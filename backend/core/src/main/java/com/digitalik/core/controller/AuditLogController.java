package com.digitalik.core.controller;

import com.digitalik.core.dto.AuditLogResponse;
import com.digitalik.core.entity.AuditLogEntry;
import com.digitalik.core.service.AuditLogService;
import java.time.LocalDate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * Bölüm 13.8/9.6 (frontend roadmap'inin ÖNERDİĞİ backend ön-koşulu):
 * {@code audit_log} tablosunu (bkz. US-01.3.1,
 * {@link com.digitalik.core.listener.AuditLogEntityListener}) filtrelenebilir/
 * sayfalanmış şekilde okuyan İLK uç — bu ana kadar yalnızca YAZMA tarafı vardı.
 *
 * <p>Yalnızca {@code ADMIN} erişebilir (roadmap'in kendi notu: "DENETIM" rolü
 * henüz YOK, bkz. {@code auth.entity.Role} — dört rol: ADMIN/IK/YONETICI/
 * CALISAN). Önce/sonra alan diff'i ve genişletilmiş audit görünümü KASITLI
 * OLARAK bu ucun kapsamı DIŞINDA (Bölüm 9.6'nın kendi genişletmesini bekler,
 * bkz. AuditLogEntry'nin javadoc'u).
 */
@RestController
@RequestMapping("/api/core/audit-log")
public class AuditLogController {

    private final AuditLogService auditLogService;

    public AuditLogController(AuditLogService auditLogService) {
        this.auditLogService = auditLogService;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Page<AuditLogResponse> search(
            @RequestParam(required = false) String entityType,
            @RequestParam(required = false) String entityId,
            @RequestParam(required = false) String performedBy,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @PageableDefault(size = 20, sort = "performedAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return auditLogService
                .search(entityType, entityId, performedBy, from, to, pageable)
                .map(AuditLogController::toResponse);
    }

    private static AuditLogResponse toResponse(AuditLogEntry entry) {
        return new AuditLogResponse(
                entry.getId(),
                entry.getEntityType(),
                entry.getEntityId(),
                entry.getOperation(),
                entry.getPerformedBy(),
                entry.getPerformedAt());
    }
}
