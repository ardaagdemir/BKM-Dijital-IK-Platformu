package com.digitalik.training.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.digitalik.training.dto.CreateTrainingEnrollmentRequest;
import com.digitalik.training.dto.TrainingEnrollmentDecisionRequest;
import com.digitalik.training.dto.TrainingRequest;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

/**
 * US-08A.1.2 kabul kriteri: "Çalışan olarak, katalogdan eğitim talep etmek
 * istiyorum. Talep, yöneticiye onaya gider."
 *
 * <p>{@code ManagerAssessmentControllerTest}'teki (performance, US-06.2.2)
 * aynı gerekçeyle, "yöneticiye onaya gider" kısıtı ({@code @PreAuthorize})
 * bu izole modül test bağlamında uygulanmaz — yalnızca Docker üzerinden
 * canlı doğrulandı (bkz. implementation log).
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class TrainingEnrollmentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void egitimTalebiOlusturulabilir() throws Exception {
        Long trainingId = egitimOlustur("İş Güvenliği Eğitimi");

        mockMvc.perform(post("/api/training/enrollments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new CreateTrainingEnrollmentRequest(5L, trainingId))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.employeeId").value(5))
                .andExpect(jsonPath("$.trainingId").value(trainingId))
                .andExpect(jsonPath("$.status").value("PENDING"));
    }

    @Test
    void olmayanEgitimIcinTalepOlusturulamazVe404Doner() throws Exception {
        mockMvc.perform(post("/api/training/enrollments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new CreateTrainingEnrollmentRequest(5L, 999999L))))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.title").value("Eğitim bulunamadı"));
    }

    @Test
    void talepOnaylanabilir() throws Exception {
        Long trainingId = egitimOlustur("İş Güvenliği Eğitimi");
        Long enrollmentId = talepOlustur(5L, trainingId);

        mockMvc.perform(put("/api/training/enrollments/" + enrollmentId + "/decision")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new TrainingEnrollmentDecisionRequest("APPROVED", null))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("APPROVED"));
    }

    @Test
    void gerekcesizRetReddedilirVe400Doner() throws Exception {
        Long trainingId = egitimOlustur("İş Güvenliği Eğitimi");
        Long enrollmentId = talepOlustur(5L, trainingId);

        mockMvc.perform(put("/api/training/enrollments/" + enrollmentId + "/decision")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new TrainingEnrollmentDecisionRequest("REJECTED", null))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail").value("Ret gerekçesi zorunludur."));
    }

    @Test
    void karariVerilmisTalepTekrarKararaBaglanamazVe400Doner() throws Exception {
        Long trainingId = egitimOlustur("İş Güvenliği Eğitimi");
        Long enrollmentId = talepOlustur(5L, trainingId);

        mockMvc.perform(put("/api/training/enrollments/" + enrollmentId + "/decision")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new TrainingEnrollmentDecisionRequest("APPROVED", null))))
                .andExpect(status().isOk());

        mockMvc.perform(put("/api/training/enrollments/" + enrollmentId + "/decision")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new TrainingEnrollmentDecisionRequest("APPROVED", null))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail").value("Bu talep zaten karara bağlanmış."));
    }

    @Test
    void olmayanTalepKararaBaglanamazVe404Doner() throws Exception {
        mockMvc.perform(put("/api/training/enrollments/999999/decision")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new TrainingEnrollmentDecisionRequest("APPROVED", null))))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.title").value("Eğitim talebi bulunamadı"));
    }

    @Test
    void calisaninTalepleriListelenir() throws Exception {
        Long trainingId = egitimOlustur("İş Güvenliği Eğitimi");
        talepOlustur(6L, trainingId);
        talepOlustur(6L, trainingId);
        talepOlustur(7L, trainingId);

        mockMvc.perform(get("/api/training/enrollments").param("employeeId", "6"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2));
    }

    @Test
    void employeeIdOlmadanListelemeReddedilirVe400Doner() throws Exception {
        mockMvc.perform(get("/api/training/enrollments"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail").value("Çalışan boş olamaz."));
    }

    private Long egitimOlustur(String name) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/training/trainings")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new TrainingRequest(name, "Zorunlu", 8, "ABC"))))
                .andExpect(status().isCreated())
                .andReturn();
        return objectMapper.readTree(result.getResponse().getContentAsString()).get("id").asLong();
    }

    private Long talepOlustur(Long employeeId, Long trainingId) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/training/enrollments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new CreateTrainingEnrollmentRequest(employeeId, trainingId))))
                .andExpect(status().isCreated())
                .andReturn();
        return objectMapper.readTree(result.getResponse().getContentAsString()).get("id").asLong();
    }
}
