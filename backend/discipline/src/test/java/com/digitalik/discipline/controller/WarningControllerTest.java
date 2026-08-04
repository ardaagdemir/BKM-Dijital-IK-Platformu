package com.digitalik.discipline.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.digitalik.discipline.dto.CreateWarningRequest;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.LocalDate;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

/**
 * US-08C.1.1 kabul kriteri: "İK kullanıcısı olarak, uyarı kaydı oluşturmak
 * istiyorum (tarih, sebep, açıklama). Kayıt çalışana bağlanır."
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class WarningControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void uyariKaydiCalisanaBaglanir() throws Exception {
        mockMvc.perform(post("/api/discipline/warnings")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new CreateWarningRequest(
                                60L, LocalDate.of(2026, 8, 15), "Devamsızlık", "Mazeretsiz iki gün işe gelmedi."))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.employeeId").value(60))
                .andExpect(jsonPath("$.date").value("2026-08-15"))
                .andExpect(jsonPath("$.reason").value("Devamsızlık"))
                .andExpect(jsonPath("$.description").value("Mazeretsiz iki gün işe gelmedi."));
    }

    @Test
    void kaydedilenUyariGeriOkunur() throws Exception {
        mockMvc.perform(post("/api/discipline/warnings")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new CreateWarningRequest(
                                61L, LocalDate.of(2026, 8, 16), "Geç kalma", "Sürekli işe geç geliyor."))))
                .andExpect(status().isCreated());

        mockMvc.perform(get("/api/discipline/warnings").param("employeeId", "61"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].reason").value("Geç kalma"));
    }

    @Test
    void bosSebepReddedilirVe400Doner() throws Exception {
        mockMvc.perform(post("/api/discipline/warnings")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new CreateWarningRequest(
                                60L, LocalDate.of(2026, 8, 15), "  ", "Açıklama"))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail").value("Sebep boş olamaz."));
    }

    @Test
    void bosAciklamaReddedilirVe400Doner() throws Exception {
        mockMvc.perform(post("/api/discipline/warnings")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new CreateWarningRequest(
                                60L, LocalDate.of(2026, 8, 15), "Sebep", "  "))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail").value("Açıklama boş olamaz."));
    }

    @Test
    void tarihsizKayitReddedilirVe400Doner() throws Exception {
        mockMvc.perform(post("/api/discipline/warnings")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new CreateWarningRequest(
                                60L, null, "Sebep", "Açıklama"))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail").value("Tarih boş olamaz."));
    }

    @Test
    void employeeIdOlmadanListelemeReddedilirVe400Doner() throws Exception {
        mockMvc.perform(get("/api/discipline/warnings"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail").value("Çalışan boş olamaz."));
    }

    @Test
    void hicUyarisiOlmayanCalisanIcinBosListeDoner() throws Exception {
        mockMvc.perform(get("/api/discipline/warnings").param("employeeId", "999999"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }
}
