package com.digitalik.core.controller;

import static org.hamcrest.Matchers.greaterThanOrEqualTo;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.digitalik.core.entity.SampleEntity;
import com.digitalik.core.repository.SampleEntityRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

/**
 * Bölüm 13.8/9.6: {@code GET /api/core/audit-log} — filtre/sayfalama
 * davranışı. Not: {@code EmployeeAccessGuardTest}'teki AYNI gerekçeyle,
 * {@code @PreAuthorize}'ın gerçek 401/403 uçtan-uca uygulanması bu izole
 * modül test ortamında ({@code CoreTestApplication}, {@code auth}'a bağımlı
 * DEĞİL) doğrulanamaz — rol kısıtı Docker canlı doğrulamasıyla kontrol edilir.
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class AuditLogControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private SampleEntityRepository sampleEntityRepository;

    @Test
    void filtre_olmadan_kayitlari_sayfali_ve_alanlari_dogru_doner() throws Exception {
        SampleEntity saved = sampleEntityRepository.save(new SampleEntity("Kayıt 1"));

        mockMvc.perform(get("/api/core/audit-log")
                        .param("entityType", "SampleEntity")
                        .param("entityId", String.valueOf(saved.getId())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content.length()").value(1))
                .andExpect(jsonPath("$.content[0].entityType").value("SampleEntity"))
                .andExpect(jsonPath("$.content[0].entityId").value(String.valueOf(saved.getId())))
                .andExpect(jsonPath("$.content[0].operation").value("CREATE"))
                .andExpect(jsonPath("$.content[0].performedBy").value("system"))
                .andExpect(jsonPath("$.content[0].performedAt").exists())
                .andExpect(jsonPath("$.page.totalElements").value(1));
    }

    @Test
    void guncelleme_de_ayri_bir_satir_olarak_gorunur() throws Exception {
        // saveAndFlush + entity yeniden yüklenerek İKİ AYRI flush (INSERT,
        // sonra UPDATE) garanti edilir — tek flush'ta INSERT+UPDATE
        // birleşirse @PostUpdate hiç TETİKLENMEZ (bkz.
        // AuditLogEntityListenerTest'teki AYNI desen).
        SampleEntity saved = sampleEntityRepository.saveAndFlush(new SampleEntity("İlk Ad"));
        SampleEntity reloaded = sampleEntityRepository.findById(saved.getId()).orElseThrow();
        reloaded.setName("Güncellenmiş Ad");
        sampleEntityRepository.saveAndFlush(reloaded);

        mockMvc.perform(get("/api/core/audit-log")
                        .param("entityType", "SampleEntity")
                        .param("entityId", String.valueOf(saved.getId())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content.length()").value(2))
                .andExpect(jsonPath("$.page.totalElements").value(2));
    }

    @Test
    void eslesmeyen_entityType_ile_bos_liste_doner() throws Exception {
        sampleEntityRepository.save(new SampleEntity("Kayıt"));

        mockMvc.perform(get("/api/core/audit-log").param("entityType", "OlmayanTur"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content.length()").value(0))
                .andExpect(jsonPath("$.page.totalElements").value(0));
    }

    @Test
    void performedBy_filtresi_kismi_ve_buyuk_kucuk_harf_duyarsiz_eslesir() throws Exception {
        sampleEntityRepository.save(new SampleEntity("Kayıt"));

        mockMvc.perform(get("/api/core/audit-log").param("performedBy", "SYS"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content.length()").value(greaterThanOrEqualTo(1)));
    }

    @Test
    void bitis_tarihi_baslangictan_once_ise_400_doner() throws Exception {
        mockMvc.perform(get("/api/core/audit-log").param("from", "2026-02-01").param("to", "2026-01-01"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void gecerli_tarih_araligindaki_kayit_bulunur() throws Exception {
        SampleEntity saved = sampleEntityRepository.save(new SampleEntity("Kayıt"));
        java.time.LocalDate today = java.time.LocalDate.now();

        mockMvc.perform(get("/api/core/audit-log")
                        .param("entityId", String.valueOf(saved.getId()))
                        .param("from", today.minusDays(1).toString())
                        .param("to", today.plusDays(1).toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content.length()").value(1));
    }

    @Test
    void araligin_disindaki_tarihle_bos_liste_doner() throws Exception {
        SampleEntity saved = sampleEntityRepository.save(new SampleEntity("Kayıt"));
        java.time.LocalDate today = java.time.LocalDate.now();

        mockMvc.perform(get("/api/core/audit-log")
                        .param("entityId", String.valueOf(saved.getId()))
                        .param("from", today.minusDays(10).toString())
                        .param("to", today.minusDays(5).toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content.length()").value(0));
    }
}
