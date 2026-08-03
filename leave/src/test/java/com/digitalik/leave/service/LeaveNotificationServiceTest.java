package com.digitalik.leave.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

import com.digitalik.leave.entity.LeaveRequest;
import java.time.LocalDate;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.mail.MailSendException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;

/**
 * US-04.3.1 kabul kriteri: "SMTP üzerinden basit, sabit metinli bir e-posta
 * gönderilir." {@code JavaMailSender} gerçek bir SMTP sunucusuna bağlanmadan
 * mock'lanıyor — canlı SMTP doğrulaması Docker'da Mailpit ile yapılıyor (bkz.
 * docs/04-implementation-log.md).
 */
class LeaveNotificationServiceTest {

    private static final String FROM_ADDRESS = "noreply@dijitalik.local";

    @Test
    void onaylananTalepIcinOnayEPostasiGonderilir() {
        JavaMailSender javaMailSender = mock(JavaMailSender.class);
        LeaveNotificationService service = new LeaveNotificationService(javaMailSender, FROM_ADDRESS);
        LeaveRequest leaveRequest =
                new LeaveRequest(1L, 2L, LocalDate.of(2026, 8, 3), LocalDate.of(2026, 8, 7), "calisan@dijitalik.local");
        leaveRequest.approve();

        service.sendDecisionNotification(leaveRequest);

        ArgumentCaptor<SimpleMailMessage> captor = ArgumentCaptor.forClass(SimpleMailMessage.class);
        verify(javaMailSender, times(1)).send(captor.capture());
        SimpleMailMessage sent = captor.getValue();
        assertThat(sent.getTo()).containsExactly("calisan@dijitalik.local");
        assertThat(sent.getFrom()).isEqualTo(FROM_ADDRESS);
        assertThat(sent.getSubject()).isEqualTo("İzin Talebiniz Onaylandı");
        assertThat(sent.getText()).contains("ONAYLANMIŞTIR");
    }

    @Test
    void reddedilenTalepIcinRetEPostasiGerekceyleGonderilir() {
        JavaMailSender javaMailSender = mock(JavaMailSender.class);
        LeaveNotificationService service = new LeaveNotificationService(javaMailSender, FROM_ADDRESS);
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
        LeaveNotificationService service = new LeaveNotificationService(javaMailSender, FROM_ADDRESS);
        LeaveRequest leaveRequest = new LeaveRequest(1L, 2L, LocalDate.of(2026, 8, 3), LocalDate.of(2026, 8, 7));
        leaveRequest.approve();

        service.sendDecisionNotification(leaveRequest);

        verify(javaMailSender, never()).send(any(SimpleMailMessage.class));
    }

    /** Kabul kriterinin doğrudan istemediği ama sağlam bir davranış: SMTP hatası kararı bozmamalı. */
    @Test
    void smtpHatasiYutulurVeYayilmaz() {
        JavaMailSender javaMailSender = mock(JavaMailSender.class);
        doThrow(new MailSendException("bağlantı hatası")).when(javaMailSender).send(any(SimpleMailMessage.class));
        LeaveNotificationService service = new LeaveNotificationService(javaMailSender, FROM_ADDRESS);
        LeaveRequest leaveRequest =
                new LeaveRequest(1L, 2L, LocalDate.of(2026, 8, 3), LocalDate.of(2026, 8, 7), "calisan@dijitalik.local");
        leaveRequest.approve();

        assertThatCode(() -> service.sendDecisionNotification(leaveRequest)).doesNotThrowAnyException();
    }
}
