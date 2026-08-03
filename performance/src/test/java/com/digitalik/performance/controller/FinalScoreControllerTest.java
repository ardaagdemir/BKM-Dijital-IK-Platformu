package com.digitalik.performance.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.digitalik.performance.dto.AssessmentWeightConfigRequest;
import com.digitalik.performance.dto.CompetencyRequest;
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
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

/**
 * US-06.2.3 kabul kriteri: "Sistem olarak, yetkinlik ve hedef puanlarından
 * basit ağırlıklı bir nihai not hesaplamak istiyorum. Ağırlıklar parametrik;
 * sonuç izlenebilir."
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class FinalScoreControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void nihaiNotKategoriAgirliklariylaHesaplanir() throws Exception {
        skalaTanimla(1, 5);
        agirlikTanimla(50, 50);
        Long goal1 = hedefOlustur("Hedef 1", 60);
        Long goal2 = hedefOlustur("Hedef 2", 40);
        Long competencyId = yetkinlikOlustur("Takım Çalışması", 100);

        Long managerAssessmentId = yoneticiDegerlendirmesiGonder(
                3L,
                List.of(
                        new SelfAssessmentScoreRequest("GOAL", goal1, 4),
                        new SelfAssessmentScoreRequest("GOAL", goal2, 2),
                        new SelfAssessmentScoreRequest("COMPETENCY", competencyId, 5)));

        // hedef kategorisi: (4*60 + 2*40) / 100 = 3.2 ; yetkinlik kategorisi: 5.0
        // nihai: (3.2*50 + 5.0*50) / 100 = 4.1
        mockMvc.perform(get("/api/performance/manager-assessments/" + managerAssessmentId + "/final-score"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.managerAssessmentId").value(managerAssessmentId))
                .andExpect(jsonPath("$.goalScore").value(3.2))
                .andExpect(jsonPath("$.competencyScore").value(5.0))
                .andExpect(jsonPath("$.goalWeight").value(50))
                .andExpect(jsonPath("$.competencyWeight").value(50))
                .andExpect(jsonPath("$.finalScore").value(4.1));
    }

    /** Kabul kriteri dolaylı gereği: bir kategoride hiç puan yoksa, nihai not diğer kategoriyle hesaplanır. */
    @Test
    void yalnizcaHedefPuanlanmisIseNihaiNotYalnizcaHedeftenHesaplanir() throws Exception {
        skalaTanimla(1, 5);
        agirlikTanimla(50, 50);
        Long goalId = hedefOlustur("Satış Hedefi", 100);

        Long managerAssessmentId =
                yoneticiDegerlendirmesiGonder(3L, List.of(new SelfAssessmentScoreRequest("GOAL", goalId, 4)));

        mockMvc.perform(get("/api/performance/manager-assessments/" + managerAssessmentId + "/final-score"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.goalScore").value(4.0))
                .andExpect(jsonPath("$.competencyScore").doesNotExist())
                .andExpect(jsonPath("$.finalScore").value(4.0));
    }

    @Test
    void agirliklandirmaTanimlanmadanNihaiNotHesaplanamazVe404Doner() throws Exception {
        skalaTanimla(1, 5);
        Long goalId = hedefOlustur("Satış Hedefi", 100);

        Long managerAssessmentId =
                yoneticiDegerlendirmesiGonder(3L, List.of(new SelfAssessmentScoreRequest("GOAL", goalId, 4)));

        mockMvc.perform(get("/api/performance/manager-assessments/" + managerAssessmentId + "/final-score"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.title").value("Ağırlıklandırma bulunamadı"));
    }

    @Test
    void olmayanDegerlendirmeIcinNihaiNotIstenirseVe404Doner() throws Exception {
        mockMvc.perform(get("/api/performance/manager-assessments/999999/final-score"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.title").value("Yönetici değerlendirmesi bulunamadı"));
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
        MvcResult result = mockMvc.perform(post("/api/performance/goals")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new GoalRequest(name, weight))))
                .andExpect(status().isCreated())
                .andReturn();
        return objectMapper.readTree(result.getResponse().getContentAsString()).get("id").asLong();
    }

    private Long yetkinlikOlustur(String name, int weight) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/performance/competencies")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new CompetencyRequest(name, weight))))
                .andExpect(status().isCreated())
                .andReturn();
        return objectMapper.readTree(result.getResponse().getContentAsString()).get("id").asLong();
    }

    private Long yoneticiDegerlendirmesiGonder(Long employeeId, List<SelfAssessmentScoreRequest> scores) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/performance/manager-assessments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new SubmitManagerAssessmentRequest(employeeId, "2026-Q1", scores))))
                .andExpect(status().isCreated())
                .andReturn();
        return objectMapper.readTree(result.getResponse().getContentAsString()).get("id").asLong();
    }
}
