package com.digitalik.auth.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;

import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.mail.MailSendException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;

/**
 * US-08D.1.4 kabul kriteri: "Bordro ekranına girişte ikinci faktör
 * istenir." {@code JavaMailSender}, {@code
 * leave.service.LeaveNotificationServiceTest}'teki (US-04.3.1) AYNI
 * gerekçeyle mock'lanıyor — canlı SMTP doğrulaması Docker'da Mailpit ile
 * yapılıyor.
 */
class StepUpNotificationServiceTest {

    private static final String FROM_ADDRESS = "noreply@dijitalik.local";

    @Test
    void dogrulamaKoduEPostaIleGonderilir() {
        JavaMailSender javaMailSender = mock(JavaMailSender.class);
        StepUpNotificationService service = new StepUpNotificationService(javaMailSender, FROM_ADDRESS);

        service.sendStepUpCode("kullanici@dijitalik.local", "042817");

        ArgumentCaptor<SimpleMailMessage> captor = ArgumentCaptor.forClass(SimpleMailMessage.class);
        verify(javaMailSender).send(captor.capture());
        SimpleMailMessage sent = captor.getValue();
        assertThat(sent.getTo()).containsExactly("kullanici@dijitalik.local");
        assertThat(sent.getFrom()).isEqualTo(FROM_ADDRESS);
        assertThat(sent.getSubject()).isEqualTo("Bordro Modülü Doğrulama Kodu");
        assertThat(sent.getText()).contains("042817");
    }

    /** Kabul kriterinin doğrudan istemediği ama sağlam bir davranış: SMTP hatası kod üretimini bozmamalı. */
    @Test
    void smtpHatasiYutulurVeYayilmaz() {
        JavaMailSender javaMailSender = mock(JavaMailSender.class);
        doThrow(new MailSendException("bağlantı hatası")).when(javaMailSender).send(any(SimpleMailMessage.class));
        StepUpNotificationService service = new StepUpNotificationService(javaMailSender, FROM_ADDRESS);

        assertThatCode(() -> service.sendStepUpCode("kullanici@dijitalik.local", "042817"))
                .doesNotThrowAnyException();
    }
}
