package com.digitalik.performance.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.digitalik.performance.dto.CompetencyRequest;
import com.digitalik.performance.dto.GoalRequest;
import com.digitalik.performance.dto.RatingScaleRequest;
import com.digitalik.performance.dto.SelfAssessmentScoreRequest;
import com.digitalik.performance.dto.SubmitSelfAssessmentRequest;
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
 * US-06.2.1 kabul kriteri: "Çalışan olarak, öz değerlendirme yapmak
 * istiyorum. Form, tanımlı hedef/yetkinlik setini gösterir."
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class SelfAssessmentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void formTanimliHedefVeYetkinlikSetiniGosterir() throws Exception {
        skalaTanimla(1, 5);
        Long goalId = hedefOlustur("Satış Hedefi", 100);
        Long competencyId = yetkinlikOlustur("Takım Çalışması", 100);

        mockMvc.perform(get("/api/performance/self-assessments/form"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.goals.length()").value(1))
                .andExpect(jsonPath("$.goals[0].id").value(goalId))
                .andExpect(jsonPath("$.competencies.length()").value(1))
                .andExpect(jsonPath("$.competencies[0].id").value(competencyId))
                .andExpect(jsonPath("$.scale.minValue").value(1))
                .andExpect(jsonPath("$.scale.maxValue").value(5));
    }

    @Test
    void skalaTanimlanmadanFormGoruntulenemezVe404Doner() throws Exception {
        mockMvc.perform(get("/api/performance/self-assessments/form"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.title").value("Puanlama skalası bulunamadı"));
    }

    @Test
    void ozDegerlendirmeGonderilebilir() throws Exception {
        skalaTanimla(1, 5);
        Long goalId = hedefOlustur("Satış Hedefi", 100);
        Long competencyId = yetkinlikOlustur("Takım Çalışması", 100);

        mockMvc.perform(post("/api/performance/self-assessments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new SubmitSelfAssessmentRequest(
                                1L,
                                List.of(
                                        new SelfAssessmentScoreRequest("GOAL", goalId, 4),
                                        new SelfAssessmentScoreRequest("COMPETENCY", competencyId, 5))))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.employeeId").value(1))
                .andExpect(jsonPath("$.scores.length()").value(2));
    }

    /** Kabul kriteri dolaylı gereği: skala sınırları dışında puan reddedilir. */
    @Test
    void skalaDisindaPuanReddedilirVe400Doner() throws Exception {
        skalaTanimla(1, 5);
        Long goalId = hedefOlustur("Satış Hedefi", 100);

        mockMvc.perform(post("/api/performance/self-assessments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new SubmitSelfAssessmentRequest(
                                1L, List.of(new SelfAssessmentScoreRequest("GOAL", goalId, 6))))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail").value("Puan 1 ile 5 arasında olmalıdır."));
    }

    @Test
    void olmayanHedefIcinPuanReddedilirVe400Doner() throws Exception {
        skalaTanimla(1, 5);

        mockMvc.perform(post("/api/performance/self-assessments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new SubmitSelfAssessmentRequest(
                                1L, List.of(new SelfAssessmentScoreRequest("GOAL", 999999L, 4))))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail").value("Belirtilen GOAL bulunamadı (id: 999999)."));
    }

    @Test
    void puansizGonderimReddedilirVe400Doner() throws Exception {
        skalaTanimla(1, 5);

        mockMvc.perform(post("/api/performance/self-assessments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new SubmitSelfAssessmentRequest(1L, List.of()))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail").value("En az bir puan girilmelidir."));
    }

    @Test
    void skalaTanimlanmadanGonderimYapilamazVe404Doner() throws Exception {
        mockMvc.perform(post("/api/performance/self-assessments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new SubmitSelfAssessmentRequest(1L, List.of(new SelfAssessmentScoreRequest("GOAL", 1L, 3))))))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.title").value("Puanlama skalası bulunamadı"));
    }

    private void skalaTanimla(int min, int max) throws Exception {
        mockMvc.perform(put("/api/performance/rating-scale")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new RatingScaleRequest(min, max))))
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
}
