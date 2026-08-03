package com.digitalik.performance.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.digitalik.performance.dto.RatingScaleRequest;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

/**
 * US-06.1.2 kabul kriteri: "İK kullanıcısı olarak, puanlama skalasını
 * (ör. 1-5) tanımlamak istiyorum."
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class RatingScaleControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void skalaTanimlanabilirVeGoruntulenebilir() throws Exception {
        mockMvc.perform(put("/api/performance/rating-scale")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new RatingScaleRequest(1, 5))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.minValue").value(1))
                .andExpect(jsonPath("$.maxValue").value(5));

        mockMvc.perform(get("/api/performance/rating-scale"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.minValue").value(1))
                .andExpect(jsonPath("$.maxValue").value(5));
    }

    /** Kabul kriteri: sistemde her zaman TEK bir skala olur — tekrar tanımlama günceller. */
    @Test
    void tekrarTanimlamaMevcutSkalayiGunceller() throws Exception {
        mockMvc.perform(put("/api/performance/rating-scale")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new RatingScaleRequest(1, 5))))
                .andExpect(status().isOk());

        mockMvc.perform(put("/api/performance/rating-scale")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new RatingScaleRequest(1, 10))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.maxValue").value(10));

        mockMvc.perform(get("/api/performance/rating-scale")).andExpect(jsonPath("$.maxValue").value(10));
    }

    @Test
    void tanimlanmadanGoruntulenemezVe404Doner() throws Exception {
        mockMvc.perform(get("/api/performance/rating-scale"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.title").value("Puanlama skalası bulunamadı"));
    }

    @Test
    void ustSinirAltSinirdanBuyukOlmalidirVe400Doner() throws Exception {
        mockMvc.perform(put("/api/performance/rating-scale")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new RatingScaleRequest(5, 5))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail").value("Üst sınır, alt sınırdan büyük olmalıdır."));

        mockMvc.perform(put("/api/performance/rating-scale")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new RatingScaleRequest(5, 1))))
                .andExpect(status().isBadRequest());
    }

    @Test
    void altSinirBirdenKucukOlamazVe400Doner() throws Exception {
        mockMvc.perform(put("/api/performance/rating-scale")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new RatingScaleRequest(0, 5))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail").value("Alt sınır 1'den küçük olamaz."));
    }
}
