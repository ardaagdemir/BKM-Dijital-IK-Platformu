package com.digitalik.core.notification;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;

import java.util.Map;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.mail.MailSendException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;

/**
 * US-09.3.1: {@code leave.LeaveNotificationService}/{@code
 * auth.StepUpNotificationService}'in taşındığı ortak gönderim mekanizması
 * — o iki servisin ESKİDEN kendi testlerinde ayrı ayrı doğruladığı SMTP
 * davranışının (from/to/subject/text, alıcısız atlama, hata yutma) artık
 * TEK bir yerde doğrulandığı test sınıfı.
 */
class EmailNotificationServiceTest {

    private static final String FROM_ADDRESS = "noreply@dijitalik.local";

    private final NotificationTemplateService templateService = new NotificationTemplateService();

    @Test
    void sablonRenderEdilipDogruAlanlarlaGonderilir() {
        JavaMailSender javaMailSender = mock(JavaMailSender.class);
        EmailNotificationService service = new EmailNotificationService(javaMailSender, templateService, FROM_ADDRESS);

        service.send("kullanici@dijitalik.local", "Bordro Modülü Doğrulama Kodu", "step-up-code", Map.of("kod", "042817"));

        ArgumentCaptor<SimpleMailMessage> captor = ArgumentCaptor.forClass(SimpleMailMessage.class);
        verify(javaMailSender).send(captor.capture());
        SimpleMailMessage sent = captor.getValue();
        assertThat(sent.getTo()).containsExactly("kullanici@dijitalik.local");
        assertThat(sent.getFrom()).isEqualTo(FROM_ADDRESS);
        assertThat(sent.getSubject()).isEqualTo("Bordro Modülü Doğrulama Kodu");
        assertThat(sent.getText()).contains("042817");
    }

    @Test
    void aliciBosIseHicGonderilmez() {
        JavaMailSender javaMailSender = mock(JavaMailSender.class);
        EmailNotificationService service = new EmailNotificationService(javaMailSender, templateService, FROM_ADDRESS);

        service.send(null, "Konu", "step-up-code", Map.of("kod", "042817"));
        service.send("  ", "Konu", "step-up-code", Map.of("kod", "042817"));

        verify(javaMailSender, never()).send(any(SimpleMailMessage.class));
    }

    @Test
    void smtpHatasiYutulurVeYayilmaz() {
        JavaMailSender javaMailSender = mock(JavaMailSender.class);
        doThrow(new MailSendException("bağlantı hatası")).when(javaMailSender).send(any(SimpleMailMessage.class));
        EmailNotificationService service = new EmailNotificationService(javaMailSender, templateService, FROM_ADDRESS);

        assertThatCode(() ->
                        service.send("kullanici@dijitalik.local", "Konu", "step-up-code", Map.of("kod", "042817")))
                .doesNotThrowAnyException();
    }
}
