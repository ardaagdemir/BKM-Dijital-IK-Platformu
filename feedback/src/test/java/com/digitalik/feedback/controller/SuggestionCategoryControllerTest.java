package com.digitalik.feedback.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

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
 * US-08F.1.1 kabul kriteri: "Kategori basit bir referans listesidir."
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class SuggestionCategoryControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void kategoriOlusturulurVeListelenir() throws Exception {
        mockMvc.perform(post("/api/suggestions/categories")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new SuggestionCategoryRequest("Süreç iyileştirme"))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.name").value("Süreç iyileştirme"));

        mockMvc.perform(get("/api/suggestions/categories"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].name").value("Süreç iyileştirme"));
    }

    @Test
    void kategoriGuncellenir() throws Exception {
        String body = mockMvc.perform(post("/api/suggestions/categories")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new SuggestionCategoryRequest("Eğitim talebi"))))
                .andReturn()
                .getResponse()
                .getContentAsString();
        long id = objectMapper.readTree(body).get("id").asLong();

        mockMvc.perform(put("/api/suggestions/categories/{id}", id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new SuggestionCategoryRequest("Maliyet tasarrufu"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Maliyet tasarrufu"));
    }

    @Test
    void kategoriSilinir() throws Exception {
        String body = mockMvc.perform(post("/api/suggestions/categories")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new SuggestionCategoryRequest("Sosyal etkinlik önerisi"))))
                .andReturn()
                .getResponse()
                .getContentAsString();
        long id = objectMapper.readTree(body).get("id").asLong();

        mockMvc.perform(delete("/api/suggestions/categories/{id}", id)).andExpect(status().isNoContent());

        mockMvc.perform(get("/api/suggestions/categories"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    void bosIsimReddedilirVe400Doner() throws Exception {
        mockMvc.perform(post("/api/suggestions/categories")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new SuggestionCategoryRequest("  "))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail").value("Kategori adı boş olamaz."));
    }

    @Test
    void olmayanKategoriGuncellenemezVe404Doner() throws Exception {
        mockMvc.perform(put("/api/suggestions/categories/{id}", 999999L)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new SuggestionCategoryRequest("Yeni ad"))))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.detail").value("Kategori bulunamadı."));
    }
}
