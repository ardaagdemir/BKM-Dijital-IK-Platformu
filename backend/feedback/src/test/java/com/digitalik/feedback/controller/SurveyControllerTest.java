package com.digitalik.feedback.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.digitalik.feedback.dto.CreateSurveyRequest;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

/**
 * US-08E.1.1 kabul kriteri: "İK kullanıcısı olarak, basit bir anket
 * oluşturup yayınlamak istiyorum. Soru+seçenek listesiyle anket oluşturulur."
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class SurveyControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void ankeSoruVeSecenekListesiyleOlusturulur() throws Exception {
        mockMvc.perform(post("/api/surveys")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new CreateSurveyRequest("Ofise dönüş sıklığı nasıl olmalı?", List.of("Haftada 2 gün", "Haftada 3 gün", "Tam zamanlı ofis"), false))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.question").value("Ofise dönüş sıklığı nasıl olmalı?"))
                .andExpect(jsonPath("$.options.length()").value(3))
                .andExpect(jsonPath("$.options[0].id").exists())
                .andExpect(jsonPath("$.options[0].text").value("Haftada 2 gün"))
                .andExpect(jsonPath("$.options[1].text").value("Haftada 3 gün"))
                .andExpect(jsonPath("$.options[2].text").value("Tam zamanlı ofis"))
                .andExpect(jsonPath("$.anonymous").value(false));
    }

    @Test
    void kaydedilenAnketListedeGeriOkunur() throws Exception {
        mockMvc.perform(post("/api/surveys")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new CreateSurveyRequest("Yemekhane memnuniyeti?", List.of("Evet", "Hayır"), false))))
                .andExpect(status().isCreated());

        mockMvc.perform(get("/api/surveys"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].question").value("Yemekhane memnuniyeti?"))
                .andExpect(jsonPath("$[0].options.length()").value(2));
    }

    @Test
    void bosSoruReddedilirVe400Doner() throws Exception {
        mockMvc.perform(post("/api/surveys")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new CreateSurveyRequest("  ", List.of("Evet", "Hayır"), false))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail").value("Soru boş olamaz."));
    }

    @Test
    void tekSecenekliAnketReddedilirVe400Doner() throws Exception {
        mockMvc.perform(post("/api/surveys")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new CreateSurveyRequest("Soru?", List.of("Tek seçenek"), false))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail").value("En az iki seçenek gereklidir."));
    }

    @Test
    void secenekListesiOlmadanOlusturmaReddedilirVe400Doner() throws Exception {
        mockMvc.perform(post("/api/surveys")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new CreateSurveyRequest("Soru?", null, false))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail").value("En az iki seçenek gereklidir."));
    }

    @Test
    void bosSecenekMetniReddedilirVe400Doner() throws Exception {
        mockMvc.perform(post("/api/surveys")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new CreateSurveyRequest("Soru?", List.of("Evet", "  "), false))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail").value("Seçenek metni boş olamaz."));
    }
}
