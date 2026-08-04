package com.digitalik.auth.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;

import com.digitalik.core.notification.EmailNotificationService;
import com.digitalik.core.notification.NotificationTemplateService;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;

/**
 * US-08D.1.4 kabul kriteri: "Bordro ekranına girişte ikinci faktör
 * istenir." US-09.3.1 ile gönderim mekanizması {@code
 * core.notification.EmailNotificationService}'e taşındı — bu test, GERÇEK
 * bir {@code EmailNotificationService} (mock'lanmış {@code JavaMailSender}
 * + gerçek {@code NotificationTemplateService} ile) kullanarak, doğru
 * şablonun render edilip doğru alıcı/konu ile GERÇEKTEN gönderildiğini
 * doğruluyor — {@code leave.LeaveNotificationServiceTest}'teki AYNI
 * gerekçeyle {@code EmailNotificationService}'i mock'lamak yerine.
 */
class StepUpNotificationServiceTest {

    private static final String FROM_ADDRESS = "noreply@dijitalik.local";

    @Test
    void dogrulamaKoduEPostaIleGonderilir() {
        JavaMailSender javaMailSender = mock(JavaMailSender.class);
        EmailNotificationService emailNotificationService =
                new EmailNotificationService(javaMailSender, new NotificationTemplateService(), FROM_ADDRESS);
        StepUpNotificationService service = new StepUpNotificationService(emailNotificationService);

        service.sendStepUpCode("kullanici@dijitalik.local", "042817");

        ArgumentCaptor<SimpleMailMessage> captor = ArgumentCaptor.forClass(SimpleMailMessage.class);
        verify(javaMailSender).send(captor.capture());
        SimpleMailMessage sent = captor.getValue();
        assertThat(sent.getTo()).containsExactly("kullanici@dijitalik.local");
        assertThat(sent.getFrom()).isEqualTo(FROM_ADDRESS);
        assertThat(sent.getSubject()).isEqualTo("Bordro Modülü Doğrulama Kodu");
        assertThat(sent.getText()).contains("042817");
    }
}
