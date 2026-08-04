package com.digitalik.organization.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.digitalik.organization.dto.CreateJobDescriptionRequest;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

/**
 * US-08I.1.2 kabul kriteri: "İK kullanıcısı olarak, unvan bazlı görev
 * tanımı yazmak istiyorum. Görev tanımı unvana bağlanır."
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class JobDescriptionControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void gorevTanimiUnvanaBaglanir() throws Exception {
        mockMvc.perform(post("/api/documents/job-descriptions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new CreateJobDescriptionRequest(10L, "Yazılım geliştirme, kod inceleme, mimari kararlara katkı."))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.jobTitleId").value(10))
                .andExpect(jsonPath("$.content").value("Yazılım geliştirme, kod inceleme, mimari kararlara katkı."));
    }

    @Test
    void kaydedilenGorevTanimiUnvaninListesindeGeriOkunur() throws Exception {
        mockMvc.perform(post("/api/documents/job-descriptions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new CreateJobDescriptionRequest(11L, "Ekip yönetimi."))))
                .andExpect(status().isCreated());

        mockMvc.perform(get("/api/documents/job-descriptions").param("jobTitleId", "11"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].content").value("Ekip yönetimi."));
    }

    @Test
    void bosIcerikReddedilirVe400Doner() throws Exception {
        mockMvc.perform(post("/api/documents/job-descriptions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new CreateJobDescriptionRequest(12L, "  "))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail").value("Görev tanımı boş olamaz."));
    }

    @Test
    void unvanBelirtilmezseReddedilirVe400Doner() throws Exception {
        mockMvc.perform(post("/api/documents/job-descriptions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new CreateJobDescriptionRequest(null, "İçerik"))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail").value("Unvan boş olamaz."));
    }

    @Test
    void jobTitleIdOlmadanListelemeReddedilirVe400Doner() throws Exception {
        mockMvc.perform(get("/api/documents/job-descriptions"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail").value("Unvan boş olamaz."));
    }

    @Test
    void hicGorevTanimiOlmayanUnvanIcinBosListeDoner() throws Exception {
        mockMvc.perform(get("/api/documents/job-descriptions").param("jobTitleId", "999999"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }
}
