package com.digitalik.performance.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.digitalik.performance.dto.AssessmentWeightConfigRequest;
import com.digitalik.performance.dto.GoalRequest;
import com.digitalik.performance.dto.RatingScaleRequest;
import com.digitalik.performance.dto.SelfAssessmentScoreRequest;
import com.digitalik.performance.dto.SubmitManagerAssessmentRequest;
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
 * US-06.3.1 kabul kriteri: "Çalışan olarak, geçmiş değerlendirme sonuçlarımı
 * görmek istiyorum. Dönem bazlı liste görüntülenir."
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class ManagerAssessmentListControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void gecmisSonuclarDonemBazliListelenir() throws Exception {
        skalaTanimla(1, 5);
        Long goalId = hedefOlustur("Satış Hedefi", 100);

        degerlendirmeGonder(5L, "2025-Q4", goalId, 3);
        degerlendirmeGonder(5L, "2026-Q1", goalId, 4);
        degerlendirmeGonder(6L, "2026-Q1", goalId, 5); // başka bir çalışan — listede görünmemeli

        // period DESC: en yeni dönem önce
        mockMvc.perform(get("/api/performance/manager-assessments").param("employeeId", "5"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].period").value("2026-Q1"))
                .andExpect(jsonPath("$[0].employeeId").value(5))
                .andExpect(jsonPath("$[1].period").value("2025-Q4"));
    }

    /** Kabul kriterinin dayandığı "sonuç" (US-06.2.3'e bağımlılık) — nihai not, ağırlıklandırma tanımlıysa listede yer alır. */
    @Test
    void agirlikliNihaiNotTanimliysaListedeYerAlir() throws Exception {
        skalaTanimla(1, 5);
        agirlikTanimla(100, 0);
        Long goalId = hedefOlustur("Satış Hedefi", 100);

        degerlendirmeGonder(7L, "2026-Q1", goalId, 4);

        mockMvc.perform(get("/api/performance/manager-assessments").param("employeeId", "7"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].finalScore").value(4.0));
    }

    /** Ağırlıklandırma tanımlanmamışsa liste başarısız olmaz — yalnızca finalScore null kalır. */
    @Test
    void agirlikTanimlanmadanFinalScoreNullDoner() throws Exception {
        skalaTanimla(1, 5);
        Long goalId = hedefOlustur("Satış Hedefi", 100);

        degerlendirmeGonder(8L, "2026-Q1", goalId, 4);

        mockMvc.perform(get("/api/performance/manager-assessments").param("employeeId", "8"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].finalScore").doesNotExist());
    }

    @Test
    void employeeIdOlmadanIstekReddedilirVe400Doner() throws Exception {
        mockMvc.perform(get("/api/performance/manager-assessments"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail").value("Çalışan boş olamaz."));
    }

    @Test
    void hicDegerlendirmesiOlmayanCalisanIcinBosListeDoner() throws Exception {
        mockMvc.perform(get("/api/performance/manager-assessments").param("employeeId", "999999"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }

    private void skalaTanimla(int min, int max) throws Exception {
        mockMvc.perform(put("/api/performance/rating-scale")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new RatingScaleRequest(min, max))))
                .andExpect(status().isOk());
    }

    private void agirlikTanimla(int goalWeight, int competencyWeight) throws Exception {
        mockMvc.perform(put("/api/performance/assessment-weight-config")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new AssessmentWeightConfigRequest(goalWeight, competencyWeight))))
                .andExpect(status().isOk());
    }

    private Long hedefOlustur(String name, int weight) throws Exception {
        var result = mockMvc.perform(post("/api/performance/goals")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new GoalRequest(name, weight))))
                .andExpect(status().isCreated())
                .andReturn();
        return objectMapper.readTree(result.getResponse().getContentAsString()).get("id").asLong();
    }

    private void degerlendirmeGonder(Long employeeId, String period, Long goalId, int score) throws Exception {
        mockMvc.perform(post("/api/performance/manager-assessments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new SubmitManagerAssessmentRequest(
                                employeeId, period, List.of(new SelfAssessmentScoreRequest("GOAL", goalId, score))))))
                .andExpect(status().isCreated());
    }
}
