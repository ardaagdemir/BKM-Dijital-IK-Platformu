package com.digitalik.performance.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.digitalik.performance.dto.AssessmentWeightConfigRequest;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

/**
 * US-06.2.3 kabul kriteri dolaylı gereği: "Ağırlıklar parametrik" —
 * Hedef/Yetkinlik kategori ağırlıkları tanımlanabilir olmalı.
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class AssessmentWeightConfigControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void agirlikTanimlanabilirVeGoruntulenebilir() throws Exception {
        mockMvc.perform(put("/api/performance/assessment-weight-config")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new AssessmentWeightConfigRequest(60, 40))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.goalWeight").value(60))
                .andExpect(jsonPath("$.competencyWeight").value(40));

        mockMvc.perform(get("/api/performance/assessment-weight-config"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.goalWeight").value(60))
                .andExpect(jsonPath("$.competencyWeight").value(40));
    }

    @Test
    void tanimlanmadanGoruntulenemezVe404Doner() throws Exception {
        mockMvc.perform(get("/api/performance/assessment-weight-config"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.title").value("Ağırlıklandırma bulunamadı"));
    }

    @Test
    void toplamYuzOlmayanAgirlikReddedilirVe400Doner() throws Exception {
        mockMvc.perform(put("/api/performance/assessment-weight-config")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new AssessmentWeightConfigRequest(60, 30))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail").value("Hedef ve yetkinlik ağırlıklarının toplamı 100 olmalıdır."));
    }
}
