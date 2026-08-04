package com.digitalik.recruitment.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.digitalik.recruitment.dto.CreateInterviewRequest;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.LocalDate;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

/** US-05.4.1 kabul kriteri: "Mülakat kaydı adayla ilişkilendirilir." */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class InterviewControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void mulakatKaydiOlusturulurVeAdaylaIliskilendirilir() throws Exception {
        Long candidateId = basvuruOlustur();

        mockMvc.perform(post("/api/recruitment/candidates/" + candidateId + "/interviews")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new CreateInterviewRequest(
                                LocalDate.of(2026, 8, 10), "Ahmet Yılmaz, Mehmet Demir", "Olumlu, ileri aşamaya geçebilir."))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.candidateId").value(candidateId))
                .andExpect(jsonPath("$.interviewDate").value("2026-08-10"))
                .andExpect(jsonPath("$.participants").value("Ahmet Yılmaz, Mehmet Demir"))
                .andExpect(jsonPath("$.result").value("Olumlu, ileri aşamaya geçebilir."));
    }

    @Test
    void birdenFazlaMulakatEnYeniOnceListelenir() throws Exception {
        Long candidateId = basvuruOlustur();
        mulakatEkle(candidateId, LocalDate.of(2026, 8, 10), "İK Mülakatı", "Olumlu.");
        mulakatEkle(candidateId, LocalDate.of(2026, 8, 17), "Teknik Mülakat", "Olumlu.");

        mockMvc.perform(get("/api/recruitment/candidates/" + candidateId + "/interviews"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].participants").value("Teknik Mülakat"))
                .andExpect(jsonPath("$[1].participants").value("İK Mülakatı"));
    }

    @Test
    void tarihOlmadanMulakatOlusturulamazVe400Doner() throws Exception {
        Long candidateId = basvuruOlustur();

        mockMvc.perform(post("/api/recruitment/candidates/" + candidateId + "/interviews")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new CreateInterviewRequest(null, "Ahmet", "Olumlu"))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail").value("Mülakat tarihi boş olamaz."));
    }

    @Test
    void olmayanAdayaMulakatEklenemezVe404Doner() throws Exception {
        mockMvc.perform(post("/api/recruitment/candidates/999999/interviews")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new CreateInterviewRequest(LocalDate.of(2026, 8, 10), "Ahmet", "Olumlu"))))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.title").value("Aday bulunamadı"));
    }

    @Test
    void olmayanAdayinMulakatlariListelenemezVe404Doner() throws Exception {
        mockMvc.perform(get("/api/recruitment/candidates/999999/interviews"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.title").value("Aday bulunamadı"));
    }

    private void mulakatEkle(Long candidateId, LocalDate date, String participants, String result) throws Exception {
        mockMvc.perform(post("/api/recruitment/candidates/" + candidateId + "/interviews")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new CreateInterviewRequest(date, participants, result))))
                .andExpect(status().isCreated());
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
}
