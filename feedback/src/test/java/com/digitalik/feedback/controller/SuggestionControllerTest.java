package com.digitalik.feedback.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.digitalik.feedback.dto.CreateSuggestionRequest;
import com.digitalik.feedback.dto.SuggestionCategoryRequest;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

/**
 * US-08F.1.1 kabul kriteri: "Çalışan olarak, kategori seçip bir talep/fikir
 * göndermek istiyorum. Kategori basit bir referans listesidir; anonim
 * seçeneği desteklenir." Durum güncelleme testleri için bkz. {@code
 * SuggestionStatusControllerTest} (US-08F.1.2).
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class SuggestionControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private long createCategory(String name) throws Exception {
        String body = mockMvc.perform(post("/api/suggestions/categories")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new SuggestionCategoryRequest(name))))
                .andReturn()
                .getResponse()
                .getContentAsString();
        return objectMapper.readTree(body).get("id").asLong();
    }

    @Test
    void talepKategoriyleGonderilirVeCalisanBilgisiTutulur() throws Exception {
        long categoryId = createCategory("Teknoloji/sistem geliştirme");

        mockMvc.perform(post("/api/suggestions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new CreateSuggestionRequest(categoryId, "Yeni bir CRM entegrasyonu önerisi.", 50L, false))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.categoryId").value(categoryId))
                .andExpect(jsonPath("$.employeeId").value(50))
                .andExpect(jsonPath("$.description").value("Yeni bir CRM entegrasyonu önerisi."))
                .andExpect(jsonPath("$.status").value("PENDING"));
    }

    @Test
    void anonimGonderimdeCalisanBilgisiTutulmaz() throws Exception {
        long categoryId = createCategory("Çalışma ortamı");

        mockMvc.perform(post("/api/suggestions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new CreateSuggestionRequest(categoryId, "Ofis sıcaklığı çok değişken.", 50L, true))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.categoryId").value(categoryId))
                .andExpect(jsonPath("$.employeeId").doesNotExist())
                .andExpect(jsonPath("$.description").value("Ofis sıcaklığı çok değişken."));
    }

    @Test
    void kaydedilenTalepCalisaninListesindeGeriOkunur() throws Exception {
        long categoryId = createCategory("Yan hak/İK uygulamaları");

        mockMvc.perform(post("/api/suggestions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new CreateSuggestionRequest(categoryId, "Esnek çalışma saatleri.", 51L, false))))
                .andExpect(status().isCreated());

        mockMvc.perform(get("/api/suggestions").param("employeeId", "51"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].description").value("Esnek çalışma saatleri."));
    }

    @Test
    void anonimOlmayanGonderimdeCalisanBelirtilmezse400Doner() throws Exception {
        long categoryId = createCategory("Eğitim talebi");

        mockMvc.perform(post("/api/suggestions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new CreateSuggestionRequest(categoryId, "Java kursu talep ediyorum.", null, false))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail").value("Çalışan boş olamaz."));
    }

    @Test
    void bosAciklamaReddedilirVe400Doner() throws Exception {
        long categoryId = createCategory("Maliyet tasarrufu");

        mockMvc.perform(post("/api/suggestions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new CreateSuggestionRequest(categoryId, "  ", 52L, false))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail").value("Açıklama boş olamaz."));
    }

    @Test
    void olmayanKategoriyleTalepGonderilemezVe404Doner() throws Exception {
        mockMvc.perform(post("/api/suggestions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new CreateSuggestionRequest(999999L, "Açıklama", 53L, false))))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.detail").value("Kategori bulunamadı."));
    }

    @Test
    void employeeIdOlmadanListelemeTumTalepleriDoner() throws Exception {
        long categoryId = createCategory("Sosyal etkinlik önerisi");
        mockMvc.perform(post("/api/suggestions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new CreateSuggestionRequest(categoryId, "Kışlık piknik düzenleyelim.", 54L, false))))
                .andExpect(status().isCreated());
        mockMvc.perform(post("/api/suggestions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new CreateSuggestionRequest(categoryId, "İsimsiz bir öneri.", 55L, true))))
                .andExpect(status().isCreated());

        mockMvc.perform(get("/api/suggestions"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2));
    }
}
