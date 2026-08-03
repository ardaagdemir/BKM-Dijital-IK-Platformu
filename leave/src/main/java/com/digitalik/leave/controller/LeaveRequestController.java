package com.digitalik.leave.controller;

import com.digitalik.leave.dto.CreateLeaveRequestRequest;
import com.digitalik.leave.dto.LeaveRequestDecisionRequest;
import com.digitalik.leave.dto.LeaveRequestResponse;
import com.digitalik.leave.entity.LeaveRequest;
import com.digitalik.leave.entity.LeaveRequestStatus;
import com.digitalik.leave.service.LeaveRequestService;
import java.time.LocalDate;
import java.util.List;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * US-04.2.1: İzin talebi oluşturma (tür, tarih aralığı) — projedeki İLK
 * "talep→onay" akışının ilk adımı (bkz. roadmap Bölüm 4.2'nin YAGNI notu:
 * onay, izin modülüne özel/basit bir mekanizma, genel bir Onay Motoru değil).
 *
 * <p>{@code hireDate}, gövdede DEĞİL isteğe bağlı bir query param —
 * {@link LeaveRequestService}'teki gerekçeyle (bakiye uyarısı için yalnızca
 * sağlanırsa kullanılır, talebin kendisinin bir alanı değil).
 *
 * <p>US-04.2.2: {@code PUT /{id}/decision} ile onay/ret. "Yönetici yalnızca
 * kendi ekibinin taleplerini onaylar" kabul kriteri, {@code teamEmployeeIds}
 * (çağıranın kendi ekibi olarak sağladığı employeeId listesi) + rol kontrolü
 * ile uygulanıyor — bkz. {@link com.digitalik.leave.security.LeaveRequestAccessGuard}'daki
 * ayrıntılı güven-sınırı notu (bu, kullanıcıyla birlikte kararlaştırılmış bir
 * mimari seçim).
 *
 * <p>US-04.2.4: {@code GET ?employeeId=...} ile bir çalışanın geçmiş/mevcut
 * talepleri (en yeni önce) listelenir — rol kısıtlaması yok, bkz.
 * {@link LeaveRequestService#listByEmployee}'deki gerekçe.
 *
 * <p>US-04.3.1: {@code create}'e isteğe bağlı {@code employeeEmail} query
 * param'ı eklendi — {@code hireDate} ile aynı desen, ama bu KALICI olarak
 * saklanıyor (bkz. {@code LeaveRequest} javadoc'u); karar (onay/ret) anında
 * bu adrese sabit metinli bir bildirim e-postası gönderilir.
 */
@RestController
@RequestMapping("/api/leave/requests")
public class LeaveRequestController {

    private final LeaveRequestService leaveRequestService;

    public LeaveRequestController(LeaveRequestService leaveRequestService) {
        this.leaveRequestService = leaveRequestService;
    }

    @PostMapping
    public ResponseEntity<LeaveRequestResponse> create(
            @RequestBody CreateLeaveRequestRequest request,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hireDate,
            @RequestParam(required = false) String employeeEmail) {
        var created = leaveRequestService.create(
                request.employeeId(),
                request.leaveTypeId(),
                request.startDate(),
                request.endDate(),
                hireDate,
                employeeEmail);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(toResponse(created.leaveRequest(), created.requestedDays(), created.balanceWarning()));
    }

    @PutMapping("/{id}/decision")
    @PreAuthorize("hasAnyRole('ADMIN', 'IK') or (hasRole('YONETICI') and @leaveRequestAccessGuard.isTeamMember(#id, #teamEmployeeIds))")
    public LeaveRequestResponse decide(
            @PathVariable Long id,
            @RequestBody LeaveRequestDecisionRequest request,
            @RequestParam(required = false) List<Long> teamEmployeeIds) {
        LeaveRequestStatus decision = parseDecision(request.decision());
        LeaveRequest leaveRequest = leaveRequestService.decide(id, decision, request.rejectionReason());
        return toResponse(leaveRequest, leaveRequest.getRequestedDays(), null);
    }

    @GetMapping
    public List<LeaveRequestResponse> list(@RequestParam(required = false) Long employeeId) {
        return leaveRequestService.listByEmployee(employeeId).stream()
                .map(leaveRequest -> toResponse(leaveRequest, leaveRequest.getRequestedDays(), null))
                .toList();
    }

    private static LeaveRequestStatus parseDecision(String decision) {
        try {
            return LeaveRequestStatus.valueOf(decision);
        } catch (IllegalArgumentException | NullPointerException ex) {
            throw new IllegalArgumentException("Karar yalnızca APPROVED veya REJECTED olabilir.");
        }
    }

    private static LeaveRequestResponse toResponse(LeaveRequest leaveRequest, long requestedDays, String balanceWarning) {
        return new LeaveRequestResponse(
                leaveRequest.getId(),
                leaveRequest.getEmployeeId(),
                leaveRequest.getLeaveTypeId(),
                leaveRequest.getStartDate(),
                leaveRequest.getEndDate(),
                leaveRequest.getStatus().name(),
                requestedDays,
                balanceWarning,
                leaveRequest.getRejectionReason(),
                leaveRequest.getEmployeeEmail());
    }
}
