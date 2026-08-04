package com.digitalik.leave.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;

import com.digitalik.core.notification.EmailNotificationService;
import com.digitalik.core.notification.NotificationTemplateService;
import com.digitalik.leave.entity.LeaveRequest;
import java.time.LocalDate;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;

/**
 * US-04.3.1 kabul kriteri: "SMTP üzerinden basit, sabit metinli bir e-posta
 * gönderilir." US-09.3.1 ile gönderim mekanizması {@code
 * core.notification.EmailNotificationService}'e taşındı — bu test, GERÇEK
 * bir {@code EmailNotificationService} (mock'lanmış {@code JavaMailSender}
 * + gerçek {@code NotificationTemplateService} ile) kullanarak, doğru
 * şablonun render edilip doğru alıcı/konu ile GERÇEKTEN gönderildiğini
 * doğruluyor — {@code EmailNotificationService}'i mock'lamak yerine (bu
 * ortamda Mockito'nun somut sınıf mock'lamasını desteklemeyen bir Java
 * 24/ByteBuddy uyumsuzluğuna takılıyor), daha güçlü bir doğrulama.
 */
class LeaveNotificationServiceTest {

    private static final String FROM_ADDRESS = "noreply@dijitalik.local";

    private LeaveNotificationService newService(JavaMailSender javaMailSender) {
        EmailNotificationService emailNotificationService =
                new EmailNotificationService(javaMailSender, new NotificationTemplateService(), FROM_ADDRESS);
        return new LeaveNotificationService(emailNotificationService);
    }

    @Test
    void onaylananTalepIcinOnayEPostasiGonderilir() {
        JavaMailSender javaMailSender = mock(JavaMailSender.class);
        LeaveNotificationService service = newService(javaMailSender);
        LeaveRequest leaveRequest =
                new LeaveRequest(1L, 2L, LocalDate.of(2026, 8, 3), LocalDate.of(2026, 8, 7), "calisan@dijitalik.local");
        leaveRequest.approve();

        service.sendDecisionNotification(leaveRequest);

        ArgumentCaptor<SimpleMailMessage> captor = ArgumentCaptor.forClass(SimpleMailMessage.class);
        verify(javaMailSender).send(captor.capture());
        SimpleMailMessage sent = captor.getValue();
        assertThat(sent.getTo()).containsExactly("calisan@dijitalik.local");
        assertThat(sent.getFrom()).isEqualTo(FROM_ADDRESS);
        assertThat(sent.getSubject()).isEqualTo("İzin Talebiniz Onaylandı");
        assertThat(sent.getText()).contains("ONAYLANMIŞTIR").contains("2026-08-03 - 2026-08-07");
    }

    @Test
    void reddedilenTalepIcinRetEPostasiGerekceyleGonderilir() {
        JavaMailSender javaMailSender = mock(JavaMailSender.class);
        LeaveNotificationService service = newService(javaMailSender);
        LeaveRequest leaveRequest =
                new LeaveRequest(1L, 2L, LocalDate.of(2026, 8, 3), LocalDate.of(2026, 8, 7), "calisan@dijitalik.local");
        leaveRequest.reject("Yoğun dönem.");

        service.sendDecisionNotification(leaveRequest);

        ArgumentCaptor<SimpleMailMessage> captor = ArgumentCaptor.forClass(SimpleMailMessage.class);
        verify(javaMailSender).send(captor.capture());
        SimpleMailMessage sent = captor.getValue();
        assertThat(sent.getSubject()).isEqualTo("İzin Talebiniz Reddedildi");
        assertThat(sent.getText()).contains("REDDEDİLMİŞTİR").contains("Yoğun dönem.");
    }

    @Test
    void ePostaAdresiYoksaHicGonderilmez() {
        JavaMailSender javaMailSender = mock(JavaMailSender.class);
        LeaveNotificationService service = newService(javaMailSender);
        LeaveRequest leaveRequest = new LeaveRequest(1L, 2L, LocalDate.of(2026, 8, 3), LocalDate.of(2026, 8, 7));
        leaveRequest.approve();

        service.sendDecisionNotification(leaveRequest);

        verify(javaMailSender, never()).send(any(SimpleMailMessage.class));
    }
}
