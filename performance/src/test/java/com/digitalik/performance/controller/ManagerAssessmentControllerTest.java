package com.digitalik.performance.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

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
 * US-06.2.2 kabul kriteri: "Yönetici olarak, bağlı çalışanı değerlendirmek
 * istiyorum. Yönetici yalnızca kendi ekibini değerlendirebilir."
 *
 * <p>{@code SelfAssessmentControllerTest}'teki (US-06.2.1) aynı gerekçeyle,
 * "yalnızca kendi ekibini" kısıtı ({@code @PreAuthorize}) bu izole modül test
 * bağlamında uygulanmaz — {@code auth.SecurityConfig}'teki {@code
 * @EnableMethodSecurity} bu modülün test sınıf yoluna dahil değil. O kısıt
 * yalnızca Docker/PostgreSQL üzerinden canlı doğrulandı (bkz. implementation
 * log).
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class ManagerAssessmentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void yoneticiDegerlendirmesiGonderilebilir() throws Exception {
        skalaTanimla(1, 5);
        Long goalId = hedefOlustur("Satış Hedefi", 100);
        Long competencyId = yetkinlikOlustur("Takım Çalışması", 100);

        mockMvc.perform(post("/api/performance/manager-assessments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new SubmitManagerAssessmentRequest(
                                2L,
                                "2026-Q1",
                                List.of(
                                        new SelfAssessmentScoreRequest("GOAL", goalId, 4),
                                        new SelfAssessmentScoreRequest("COMPETENCY", competencyId, 5))))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.employeeId").value(2))
                .andExpect(jsonPath("$.period").value("2026-Q1"))
                .andExpect(jsonPath("$.scores.length()").value(2));
    }

    /** Kabul kriteri dolaylı gereği: skala sınırları dışında puan reddedilir. */
    @Test
    void skalaDisindaPuanReddedilirVe400Doner() throws Exception {
        skalaTanimla(1, 5);
        Long goalId = hedefOlustur("Satış Hedefi", 100);

        mockMvc.perform(post("/api/performance/manager-assessments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new SubmitManagerAssessmentRequest(
                                2L, "2026-Q1", List.of(new SelfAssessmentScoreRequest("GOAL", goalId, 6))))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail").value("Puan 1 ile 5 arasında olmalıdır."));
    }

    @Test
    void olmayanHedefIcinPuanReddedilirVe400Doner() throws Exception {
        skalaTanimla(1, 5);

        mockMvc.perform(post("/api/performance/manager-assessments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new SubmitManagerAssessmentRequest(
                                2L, "2026-Q1", List.of(new SelfAssessmentScoreRequest("GOAL", 999999L, 4))))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail").value("Belirtilen GOAL bulunamadı (id: 999999)."));
    }

    @Test
    void puansizGonderimReddedilirVe400Doner() throws Exception {
        skalaTanimla(1, 5);

        mockMvc.perform(post("/api/performance/manager-assessments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new SubmitManagerAssessmentRequest(2L, "2026-Q1", List.of()))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail").value("En az bir puan girilmelidir."));
    }

    /** US-06.3.1 dolaylı gereği: liste görüntülemenin dayandığı {@code period} alanı boş olamaz. */
    @Test
    void bosDonemReddedilirVe400Doner() throws Exception {
        skalaTanimla(1, 5);
        Long goalId = hedefOlustur("Satış Hedefi", 100);

        mockMvc.perform(post("/api/performance/manager-assessments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new SubmitManagerAssessmentRequest(
                                2L, " ", List.of(new SelfAssessmentScoreRequest("GOAL", goalId, 4))))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail").value("Dönem boş olamaz."));
    }

    @Test
    void skalaTanimlanmadanGonderimYapilamazVe404Doner() throws Exception {
        mockMvc.perform(post("/api/performance/manager-assessments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new SubmitManagerAssessmentRequest(
                                2L, "2026-Q1", List.of(new SelfAssessmentScoreRequest("GOAL", 1L, 3))))))
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
