package com.digitalik.auth.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

/**
 * US-08D.1.4: Bordro modülü erişim doğrulama kodunu SMTP üzerinden basit,
 * sabit metinli bir e-posta ile gönderir — {@code
 * leave.LeaveNotificationService}'teki (US-04.3.1) AYNI desen: genel bir
 * bildirim motoru/şablon sistemi DEĞİL, tek, sabit kodlu bir şablon.
 *
 * <p>SMTP hataları (bağlantı sorunu vb.) YUTULUP LOGLANIR, kod
 * üretme/işlemine YAYILMAZ — {@code LeaveNotificationService}'teki AYNI
 * gerekçe: geçici bir e-posta sunucusu sorunu, kodun veritabanına
 * işlenmiş olmasını (ve isteğin başarılı 204 dönmesini) engellememeli.
 */
@Service
public class StepUpNotificationService {

    private static final Logger log = LoggerFactory.getLogger(StepUpNotificationService.class);

    private final JavaMailSender javaMailSender;
    private final String fromAddress;

    public StepUpNotificationService(
            JavaMailSender javaMailSender, @Value("${app.mail.from-address}") String fromAddress) {
        this.javaMailSender = javaMailSender;
        this.fromAddress = fromAddress;
    }

    public void sendStepUpCode(String toAddress, String code) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromAddress);
        message.setTo(toAddress);
        message.setSubject("Bordro Modülü Doğrulama Kodu");
        message.setText(
                "Sayın kullanıcımız,\n\nBordro modülüne erişim için doğrulama kodunuz: %s\n\nBu kod 5 dakika içinde geçerliliğini yitirecektir.\n\nDijital İK Platformu"
                        .formatted(code));

        try {
            javaMailSender.send(message);
        } catch (MailException ex) {
            log.error("Bordro doğrulama kodu e-postası gönderilemedi (alıcı={})", toAddress, ex);
        }
    }
}
