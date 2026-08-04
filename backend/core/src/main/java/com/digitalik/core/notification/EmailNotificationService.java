package com.digitalik.core.notification;

import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

/**
 * US-09.3.1: {@code leave.LeaveNotificationService}/{@code
 * auth.StepUpNotificationService}'teki (US-04.3.1/US-08D.1.4) AYNI SMTP
 * gönderim desenini merkezileştirir — o iki servis (ve yeni tüketiciler)
 * artık yalnızca HANGİ şablon/alıcı/konu olduğuna karar verip buraya
 * delege eder.
 *
 * <p>Alıcı adresi boş/null ise SESSİZCE atlanır — {@code
 * LeaveNotificationService}'teki orijinal gerekçenin AYNISI, artık genel
 * bir davranış: bildirim, çağıranın birincil iş akışını ASLA engellememeli.
 *
 * <p>SMTP hataları YUTULUP LOGLANIR, çağırana YAYILMAZ — geçici bir SMTP
 * sorunu, gerçekleşmiş bir iş kararını başarısız bir HTTP isteğine
 * çevirmemeli (o iki servisteki AYNI gerekçe).
 */
@Service
public class EmailNotificationService {

    private static final Logger log = LoggerFactory.getLogger(EmailNotificationService.class);

    private final JavaMailSender javaMailSender;
    private final NotificationTemplateService templateService;
    private final String fromAddress;

    public EmailNotificationService(
            JavaMailSender javaMailSender,
            NotificationTemplateService templateService,
            @Value("${app.mail.from-address}") String fromAddress) {
        this.javaMailSender = javaMailSender;
        this.templateService = templateService;
        this.fromAddress = fromAddress;
    }

    public void send(String toAddress, String subject, String templateName, Map<String, String> placeholders) {
        if (toAddress == null || toAddress.isBlank()) {
            return;
        }

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromAddress);
        message.setTo(toAddress);
        message.setSubject(subject);
        message.setText(templateService.render(templateName, placeholders));

        try {
            javaMailSender.send(message);
        } catch (MailException ex) {
            log.error("E-posta bildirimi gönderilemedi (şablon={}, alıcı={})", templateName, toAddress, ex);
        }
    }
}
