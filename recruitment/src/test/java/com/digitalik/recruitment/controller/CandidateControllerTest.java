package com.digitalik.recruitment.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.digitalik.recruitment.dto.CandidateStageRequest;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

/**
 * US-05.2.1 kabul kriteri: "Başvuru formu temel bilgileri (ad-soyad,
 * iletişim, pozisyon) + CV dosyası alır; giriş yapmış İK kullanıcısından
 * bağımsız bir erişimdir." Bu modülün kendi izole test ortamında Spring
 * Security hiç yok (bkz. organization.OrganizationUnitControllerTest'teki
 * aynı gerekçe) — "kimlik doğrulamasız erişim" gerçek davranışı Docker'da
 * doğrulanıyor; bu testler yalnızca CandidateController/Service mantığını
 * doğrular.
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class CandidateControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void basvuruOlusturulur() throws Exception {
        MockMultipartFile cv = new MockMultipartFile("cv", "cv.pdf", "application/pdf", "örnek cv içeriği".getBytes());

        mockMvc.perform(multipart("/api/recruitment/candidates/applications")
                        .file(cv)
                        .param("firstName", "Ahmet")
                        .param("lastName", "Yılmaz")
                        .param("email", "ahmet@ornek.com")
                        .param("appliedPosition", "Yazılım Mühendisi"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.firstName").value("Ahmet"))
                .andExpect(jsonPath("$.lastName").value("Yılmaz"))
                .andExpect(jsonPath("$.email").value("ahmet@ornek.com"))
                .andExpect(jsonPath("$.appliedPosition").value("Yazılım Mühendisi"))
                .andExpect(jsonPath("$.cvFileName").value("cv.pdf"))
                .andExpect(jsonPath("$.stage").value("APPLICATION"));
    }

    /** US-05.2.2 kabul kriteri: "aşama (başvuru/mülakat/teklif/işe alım/ret) güncellenebilir." */
    @Test
    void asamaGuncellenebilir() throws Exception {
        Long candidateId = basvuruOlustur();

        mockMvc.perform(put("/api/recruitment/candidates/" + candidateId + "/stage")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new CandidateStageRequest("INTERVIEW"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.stage").value("INTERVIEW"));
    }

    @Test
    void gecersizAsamaDegeriyle400Doner() throws Exception {
        Long candidateId = basvuruOlustur();

        mockMvc.perform(put("/api/recruitment/candidates/" + candidateId + "/stage")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new CandidateStageRequest("FOO"))))
                .andExpect(status().isBadRequest());
    }

    @Test
    void olmayanAdayinAsamasiGuncellenemezVe404Doner() throws Exception {
        mockMvc.perform(put("/api/recruitment/candidates/999999/stage")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new CandidateStageRequest("INTERVIEW"))))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.title").value("Aday bulunamadı"));
    }

    private Long basvuruOlustur() throws Exception {
        MockMultipartFile cv = new MockMultipartFile("cv", "cv.pdf", "application/pdf", "örnek cv içeriği".getBytes());
        MvcResult result = mockMvc.perform(multipart("/api/recruitment/candidates/applications")
                        .file(cv)
                        .param("firstName", "Ahmet")
                        .param("lastName", "Yılmaz")
                        .param("email", "ahmet@ornek.com")
                        .param("appliedPosition", "Yazılım Mühendisi"))
                .andExpect(status().isCreated())
                .andReturn();
        return objectMapper.readTree(result.getResponse().getContentAsString()).get("id").asLong();
    }

    /** US-05.4.2 kabul kriteri: "Aday bilgileri ... çalışan oluşturma akışına aktarılır." */
    @Test
    void adayCalisanTaslaginaDonusturulur() throws Exception {
        Long candidateId = basvuruOlustur();

        mockMvc.perform(post("/api/recruitment/candidates/" + candidateId + "/convert-to-employee"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.candidateId").value(candidateId))
                .andExpect(jsonPath("$.firstName").value("Ahmet"))
                .andExpect(jsonPath("$.lastName").value("Yılmaz"))
                .andExpect(jsonPath("$.email").value("ahmet@ornek.com"));
    }

    @Test
    void ayniAdayTekrarDonusturulemezVe400Doner() throws Exception {
        Long candidateId = basvuruOlustur();

        mockMvc.perform(post("/api/recruitment/candidates/" + candidateId + "/convert-to-employee"))
                .andExpect(status().isOk());

        mockMvc.perform(post("/api/recruitment/candidates/" + candidateId + "/convert-to-employee"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail").value("Bu aday zaten bir çalışan kaydına dönüştürülmüş."));
    }

    @Test
    void olmayanAdayDonusturulemezVe404Doner() throws Exception {
        mockMvc.perform(post("/api/recruitment/candidates/999999/convert-to-employee"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.title").value("Aday bulunamadı"));
    }

    @Test
    void cvOlmadanBasvuruOlusturulamazVe400Doner() throws Exception {
        mockMvc.perform(multipart("/api/recruitment/candidates/applications")
                        .param("firstName", "Ahmet")
                        .param("lastName", "Yılmaz")
                        .param("email", "ahmet@ornek.com")
                        .param("appliedPosition", "Yazılım Mühendisi"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail").value("CV dosyası boş olamaz."));
    }

    @Test
    void bosCvIleBasvuruOlusturulamazVe400Doner() throws Exception {
        MockMultipartFile emptyCv = new MockMultipartFile("cv", "cv.pdf", "application/pdf", new byte[0]);

        mockMvc.perform(multipart("/api/recruitment/candidates/applications")
                        .file(emptyCv)
                        .param("firstName", "Ahmet")
                        .param("lastName", "Yılmaz")
                        .param("email", "ahmet@ornek.com")
                        .param("appliedPosition", "Yazılım Mühendisi"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail").value("CV dosyası boş olamaz."));
    }

    @Test
    void adOlmadanBasvuruOlusturulamazVe400Doner() throws Exception {
        MockMultipartFile cv = new MockMultipartFile("cv", "cv.pdf", "application/pdf", "içerik".getBytes());

        mockMvc.perform(multipart("/api/recruitment/candidates/applications")
                        .file(cv)
                        .param("lastName", "Yılmaz")
                        .param("email", "ahmet@ornek.com")
                        .param("appliedPosition", "Yazılım Mühendisi"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail").value("Ad boş olamaz."));
    }

    @Test
    void pozisyonOlmadanBasvuruOlusturulamazVe400Doner() throws Exception {
        MockMultipartFile cv = new MockMultipartFile("cv", "cv.pdf", "application/pdf", "içerik".getBytes());

        mockMvc.perform(multipart("/api/recruitment/candidates/applications")
                        .file(cv)
                        .param("firstName", "Ahmet")
                        .param("lastName", "Yılmaz")
                        .param("email", "ahmet@ornek.com"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail").value("Başvurulan pozisyon boş olamaz."));
    }
}
