package com.digitalik.recruitment.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.digitalik.recruitment.dto.CandidateNoteRequest;
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

/** US-05.2.2 kabul kriteri: "Not ekleme." */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class CandidateNoteControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void notEklenirVeListelenir() throws Exception {
        Long candidateId = basvuruOlustur();

        mockMvc.perform(post("/api/recruitment/candidates/" + candidateId + "/notes")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new CandidateNoteRequest("Mülakata çağrıldı."))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.candidateId").value(candidateId))
                .andExpect(jsonPath("$.noteText").value("Mülakata çağrıldı."));

        mockMvc.perform(post("/api/recruitment/candidates/" + candidateId + "/notes")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new CandidateNoteRequest("Teknik mülakat olumlu geçti."))))
                .andExpect(status().isCreated());

        mockMvc.perform(get("/api/recruitment/candidates/" + candidateId + "/notes"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].noteText").value("Teknik mülakat olumlu geçti."))
                .andExpect(jsonPath("$[1].noteText").value("Mülakata çağrıldı."));
    }

    @Test
    void bosNotEklenemezVe400Doner() throws Exception {
        Long candidateId = basvuruOlustur();

        mockMvc.perform(post("/api/recruitment/candidates/" + candidateId + "/notes")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new CandidateNoteRequest("  "))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail").value("Not metni boş olamaz."));
    }

    @Test
    void olmayanAdayaNotEklenemezVe404Doner() throws Exception {
        mockMvc.perform(post("/api/recruitment/candidates/999999/notes")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new CandidateNoteRequest("Not."))))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.title").value("Aday bulunamadı"));
    }

    @Test
    void olmayanAdayinNotlariListelenemezVe404Doner() throws Exception {
        mockMvc.perform(get("/api/recruitment/candidates/999999/notes"))
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
}
