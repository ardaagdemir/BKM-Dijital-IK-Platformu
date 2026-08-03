package com.digitalik.training.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.digitalik.training.dto.CompleteTrainingEnrollmentRequest;
import com.digitalik.training.dto.CreateTrainingEnrollmentRequest;
import com.digitalik.training.dto.TrainingEnrollmentDecisionRequest;
import com.digitalik.training.dto.TrainingRequest;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.LocalDate;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

/**
 * US-08A.1.3 kabul kriteri: "İK kullanıcısı olarak, tamamlanan eğitimleri
 * çalışan bazında görmek istiyorum. Liste; çalışan+eğitim+tarih gösterir."
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class CompletedTrainingControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void onaylanmisTalepTamamlandiOlarakIsaretlenebilir() throws Exception {
        Long trainingId = egitimOlustur("İş Güvenliği Eğitimi");
        Long enrollmentId = talepOlusturVeOnayla(10L, trainingId);

        mockMvc.perform(put("/api/training/enrollments/" + enrollmentId + "/complete")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new CompleteTrainingEnrollmentRequest(LocalDate.of(2026, 8, 10)))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("COMPLETED"))
                .andExpect(jsonPath("$.completedDate").value("2026-08-10"));
    }

    @Test
    void onaylanmamisTalepTamamlanamazVe400Doner() throws Exception {
        Long trainingId = egitimOlustur("İş Güvenliği Eğitimi");
        MvcResult result = mockMvc.perform(post("/api/training/enrollments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new CreateTrainingEnrollmentRequest(11L, trainingId))))
                .andExpect(status().isCreated())
                .andReturn();
        Long enrollmentId = objectMapper.readTree(result.getResponse().getContentAsString()).get("id").asLong();

        mockMvc.perform(put("/api/training/enrollments/" + enrollmentId + "/complete")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new CompleteTrainingEnrollmentRequest(LocalDate.of(2026, 8, 10)))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail").value("Yalnızca onaylanmış bir talep tamamlandı olarak işaretlenebilir."));
    }

    @Test
    void olmayanTalepTamamlanamazVe404Doner() throws Exception {
        mockMvc.perform(put("/api/training/enrollments/999999/complete")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new CompleteTrainingEnrollmentRequest(LocalDate.of(2026, 8, 10)))))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.title").value("Eğitim talebi bulunamadı"));
    }

    @Test
    void tamamlananEgitimlerCalisanEgitimTarihGosterir() throws Exception {
        Long trainingId = egitimOlustur("İş Güvenliği Eğitimi");
        Long enrollmentId = talepOlusturVeOnayla(12L, trainingId);
        mockMvc.perform(put("/api/training/enrollments/" + enrollmentId + "/complete")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new CompleteTrainingEnrollmentRequest(LocalDate.of(2026, 8, 10)))))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/training/enrollments/completed").param("employeeId", "12"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].employeeId").value(12))
                .andExpect(jsonPath("$[0].trainingName").value("İş Güvenliği Eğitimi"))
                .andExpect(jsonPath("$[0].completedDate").value("2026-08-10"));
    }

    /** Kabul kriteri dolaylı gereği: yalnızca tamamlananlar rapora girer, onay bekleyen/reddedilen kayıtlar sızmaz. */
    @Test
    void yalnizcaTamamlananlarRaporaGirer() throws Exception {
        Long trainingId = egitimOlustur("İş Güvenliği Eğitimi");
        // PENDING (onaylanmamış)
        mockMvc.perform(post("/api/training/enrollments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new CreateTrainingEnrollmentRequest(13L, trainingId))))
                .andExpect(status().isCreated());

        mockMvc.perform(get("/api/training/enrollments/completed").param("employeeId", "13"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    void employeeIdOlmadanTumTamamlananlarDoner() throws Exception {
        Long trainingId = egitimOlustur("İş Güvenliği Eğitimi");
        Long enrollmentId = talepOlusturVeOnayla(14L, trainingId);
        mockMvc.perform(put("/api/training/enrollments/" + enrollmentId + "/complete")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new CompleteTrainingEnrollmentRequest(LocalDate.of(2026, 8, 10)))))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/training/enrollments/completed"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));
    }

    private Long egitimOlustur(String name) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/training/trainings")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new TrainingRequest(name, "Zorunlu", 8, "ABC"))))
                .andExpect(status().isCreated())
                .andReturn();
        return objectMapper.readTree(result.getResponse().getContentAsString()).get("id").asLong();
    }

    private Long talepOlusturVeOnayla(Long employeeId, Long trainingId) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/training/enrollments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new CreateTrainingEnrollmentRequest(employeeId, trainingId))))
                .andExpect(status().isCreated())
                .andReturn();
        Long enrollmentId = objectMapper.readTree(result.getResponse().getContentAsString()).get("id").asLong();

        mockMvc.perform(put("/api/training/enrollments/" + enrollmentId + "/decision")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new TrainingEnrollmentDecisionRequest("APPROVED", null))))
                .andExpect(status().isOk());

        return enrollmentId;
    }
}
