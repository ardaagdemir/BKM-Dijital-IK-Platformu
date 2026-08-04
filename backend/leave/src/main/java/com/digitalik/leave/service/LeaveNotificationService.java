package com.digitalik.leave.service;

import com.digitalik.core.notification.EmailNotificationService;
import com.digitalik.leave.entity.LeaveRequest;
import com.digitalik.leave.entity.LeaveRequestStatus;
import java.util.Map;
import org.springframework.stereotype.Service;

/**
 * US-04.3.1: İzin talebi onaylandığında/reddedildiğinde çalışana bildirim
 * gönderir. US-09.3.1 ile gönderim mekanizması (SMTP + şablon render)
 * {@code core.notification.EmailNotificationService}'e taşındı — bu sınıf
 * artık yalnızca HANGİ şablon/alıcı/konu olduğuna karar veren ince bir
 * sarmalayıcı; public API'si ({@code sendDecisionNotification}) ve dışa
 * dönük davranışı DEĞİŞMEDİ.
 */
@Service
public class LeaveNotificationService {

    private final EmailNotificationService emailNotificationService;

    public LeaveNotificationService(EmailNotificationService emailNotificationService) {
        this.emailNotificationService = emailNotificationService;
    }

    public void sendDecisionNotification(LeaveRequest leaveRequest) {
        String donem = leaveRequest.getStartDate() + " - " + leaveRequest.getEndDate();
        boolean approved = leaveRequest.getStatus() == LeaveRequestStatus.APPROVED;

        emailNotificationService.send(
                leaveRequest.getEmployeeEmail(),
                approved ? "İzin Talebiniz Onaylandı" : "İzin Talebiniz Reddedildi",
                approved ? "leave-decision-approved" : "leave-decision-rejected",
                approved
                        ? Map.of("donem", donem)
                        : Map.of("donem", donem, "gerekce", leaveRequest.getRejectionReason()));
    }
}
