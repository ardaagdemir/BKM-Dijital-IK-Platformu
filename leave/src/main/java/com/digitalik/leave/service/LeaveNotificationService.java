package com.digitalik.leave.service;

import com.digitalik.leave.entity.LeaveRequest;
import com.digitalik.leave.entity.LeaveRequestStatus;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

/**
 * US-04.3.1: İzin talebi onaylandığında/reddedildiğinde çalışana SMTP
 * üzerinden basit, sabit metinli bir e-posta gönderir. Roadmap Bölüm
 * 4.3'ün YAGNI notuyla tutarlı: genel bir bildirim motoru/şablon sistemi
 * DEĞİL — tek, sabit kodlu şablon.
 *
 * <p>{@code leaveRequest.getEmployeeEmail()} null ise (çağıran talep
 * oluştururken e-posta sağlamadıysa) SESSİZCE atlanır — bildirim, kabul
 * kriterinin doğrudan gerektirdiği bir ek, temel akışı (onay/ret işleminin
 * kendisi) ENGELLEMEMESİ gereken bir yan etki.
 *
 * <p>SMTP hataları (bağlantı sorunu vb.) YUTULUP LOGLANIR, karara bağlama
 * işlemine YAYILMAZ — geçici bir e-posta sunucusu sorunu, gerçekleşmiş bir
 * onay/ret kararını başarısız bir HTTP isteğine çevirmemeli.
 */
@Service
public class LeaveNotificationService {

    private static final Logger log = LoggerFactory.getLogger(LeaveNotificationService.class);

    private final JavaMailSender javaMailSender;
    private final String fromAddress;

    public LeaveNotificationService(
            JavaMailSender javaMailSender, @Value("${app.mail.from-address}") String fromAddress) {
        this.javaMailSender = javaMailSender;
        this.fromAddress = fromAddress;
    }

    public void sendDecisionNotification(LeaveRequest leaveRequest) {
        String toAddress = leaveRequest.getEmployeeEmail();
        if (toAddress == null || toAddress.isBlank()) {
            return;
        }

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromAddress);
        message.setTo(toAddress);
        message.setSubject(subjectFor(leaveRequest.getStatus()));
        message.setText(bodyFor(leaveRequest));

        try {
            javaMailSender.send(message);
        } catch (MailException ex) {
            log.error("İzin talebi karar e-postası gönderilemedi (talep id={}, alıcı={})", leaveRequest.getId(),
                    toAddress, ex);
        }
    }

    private String subjectFor(LeaveRequestStatus status) {
        return status == LeaveRequestStatus.APPROVED ? "İzin Talebiniz Onaylandı" : "İzin Talebiniz Reddedildi";
    }

    private String bodyFor(LeaveRequest leaveRequest) {
        String donem = leaveRequest.getStartDate() + " - " + leaveRequest.getEndDate();
        if (leaveRequest.getStatus() == LeaveRequestStatus.APPROVED) {
            return "Sayın çalışanımız,\n\n%s tarihleri arasındaki izin talebiniz ONAYLANMIŞTIR.\n\nDijital İK Platformu"
                    .formatted(donem);
        }
        return ("Sayın çalışanımız,\n\n%s tarihleri arasındaki izin talebiniz REDDEDİLMİŞTİR.\n"
                        + "Gerekçe: %s\n\nDijital İK Platformu")
                .formatted(donem, leaveRequest.getRejectionReason());
    }
}
