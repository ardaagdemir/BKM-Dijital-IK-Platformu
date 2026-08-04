package com.digitalik.core.notification;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.Map;
import org.junit.jupiter.api.Test;

/**
 * US-09.3.1: {@code core.notification}'ın şablon motoru — {@code {{alan}}}
 * yer-tutucularının doğru değiştirildiğini ve gerçek şablon dosyalarının
 * (leave/auth'un migrasyonuyla eklenen) okunabildiğini doğrular.
 */
class NotificationTemplateServiceTest {

    private final NotificationTemplateService service = new NotificationTemplateService();

    @Test
    void yerTutucularDogruDegerlerleDegistirilir() {
        String result = service.render("leave-decision-approved", Map.of("donem", "2026-08-03 - 2026-08-07"));

        assertThat(result).contains("2026-08-03 - 2026-08-07").contains("ONAYLANMIŞTIR");
    }

    @Test
    void birdenFazlaYerTutucuAyniAndaDegistirilir() {
        String result = service.render(
                "leave-decision-rejected", Map.of("donem", "2026-08-03 - 2026-08-07", "gerekce", "Yoğun dönem."));

        assertThat(result).contains("2026-08-03 - 2026-08-07").contains("Yoğun dönem.").contains("REDDEDİLMİŞTİR");
    }

    @Test
    void stepUpKoduSablonuOkunur() {
        String result = service.render("step-up-code", Map.of("kod", "042817"));

        assertThat(result).contains("042817");
    }

    @Test
    void olmayanSablonIstenirseAcikHataFirlatilir() {
        assertThatThrownBy(() -> service.render("olmayan-sablon", Map.of()))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("olmayan-sablon");
    }
}
