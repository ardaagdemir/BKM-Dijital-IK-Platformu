package com.digitalik.platform.customfield;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.digitalik.platform.customfield.dto.CustomFieldValueResponse;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

/**
 * US-09.5.1: {@link CustomFieldValueService}'in tip doğrulaması (NUMBER/
 * DATE/SELECT) ve upsert semantiği.
 */
@SpringBootTest
@Transactional
class CustomFieldValueServiceTest {

    @Autowired
    private CustomFieldDefinitionService customFieldDefinitionService;

    @Autowired
    private CustomFieldValueService customFieldValueService;

    @Test
    void tanimliAlanlarIcinDegerYoksaNullDoner() {
        customFieldDefinitionService.create("TestEntity", "notlar", CustomFieldType.TEXT, null, false);

        List<CustomFieldValueResponse> values = customFieldValueService.getValues("TestEntity", 1L);

        assertThat(values).hasSize(1);
        assertThat(values.get(0).fieldName()).isEqualTo("notlar");
        assertThat(values.get(0).value()).isNull();
    }

    @Test
    void metinAlaniKaydedilirVeOkunur() {
        customFieldDefinitionService.create("TestEntity", "notlar", CustomFieldType.TEXT, null, false);

        List<CustomFieldValueResponse> result =
                customFieldValueService.setValues("TestEntity", 2L, Map.of("notlar", "merhaba"));

        assertThat(result.get(0).value()).isEqualTo("merhaba");
    }

    @Test
    void sayiAlaniSayiOlmayanDegerleReddedilir() {
        customFieldDefinitionService.create("TestEntity", "puan", CustomFieldType.NUMBER, null, false);

        assertThatThrownBy(() -> customFieldValueService.setValues("TestEntity", 3L, Map.of("puan", "abc")))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("puan sayısal bir değer olmalıdır.");
    }

    @Test
    void tarihAlaniGecerliIsoTarihiKabulEder() {
        customFieldDefinitionService.create("TestEntity", "baslangic", CustomFieldType.DATE, null, false);

        List<CustomFieldValueResponse> result =
                customFieldValueService.setValues("TestEntity", 4L, Map.of("baslangic", "2026-01-15"));

        assertThat(result.get(0).value()).isEqualTo("2026-01-15");
    }

    @Test
    void secimAlaniTanimliOlmayanSecenekleReddedilir() {
        customFieldDefinitionService.create("TestEntity", "seviye", CustomFieldType.SELECT, "A1,A2,B1", false);

        assertThatThrownBy(() -> customFieldValueService.setValues("TestEntity", 5L, Map.of("seviye", "C2")))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("seviye geçerli bir seçenek değil.");
    }

    @Test
    void zorunluAlanEksikseReddedilir() {
        customFieldDefinitionService.create("TestEntity", "zorunluAlan", CustomFieldType.TEXT, null, true);

        assertThatThrownBy(() -> customFieldValueService.setValues("TestEntity", 6L, Map.of()))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("zorunluAlan alanı zorunludur.");
    }

    @Test
    void bilinmeyenAlanReddedilir() {
        assertThatThrownBy(() -> customFieldValueService.setValues("TestEntity", 7L, Map.of("olmayanAlan", "x")))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Bilinmeyen alan: olmayanAlan");
    }

    @Test
    void ayniAlaninDegeriTekrarYazilirsaGuncellenir() {
        customFieldDefinitionService.create("TestEntity", "notlar", CustomFieldType.TEXT, null, false);
        customFieldValueService.setValues("TestEntity", 8L, Map.of("notlar", "ilk"));

        List<CustomFieldValueResponse> result =
                customFieldValueService.setValues("TestEntity", 8L, Map.of("notlar", "guncel"));

        assertThat(result.get(0).value()).isEqualTo("guncel");
    }
}
