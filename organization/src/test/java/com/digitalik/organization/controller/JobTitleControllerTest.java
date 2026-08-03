package com.digitalik.organization.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.digitalik.organization.dto.JobTitleRequest;
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
 * US-03.1.2 kabul kriteri: "Unvan CRUD ekranından yönetilir; birimlerden
 * bağımsız bir referans listesidir."
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class JobTitleControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void unvanOlusturulabilir() throws Exception {
        mockMvc.perform(post("/api/organization/job-titles")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new JobTitleRequest("Yazılım Mühendisi"))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.name").value("Yazılım Mühendisi"));
    }

    @Test
    void tumUnvanlarListelenir() throws Exception {
        unvanOlustur("Yazılım Mühendisi");
        unvanOlustur("İK Uzmanı");

        mockMvc.perform(get("/api/organization/job-titles"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2));
    }

    @Test
    void unvanGuncellenebilir() throws Exception {
        Long id = unvanOlustur("Yazılım Mühendisi");

        mockMvc.perform(put("/api/organization/job-titles/" + id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new JobTitleRequest("Kıdemli Yazılım Mühendisi"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(id))
                .andExpect(jsonPath("$.name").value("Kıdemli Yazılım Mühendisi"));

        mockMvc.perform(get("/api/organization/job-titles"))
                .andExpect(jsonPath("$[0].name").value("Kıdemli Yazılım Mühendisi"));
    }

    @Test
    void olmayanUnvanGuncellenemezVe404Doner() throws Exception {
        mockMvc.perform(put("/api/organization/job-titles/999999")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new JobTitleRequest("Hayalet Unvan"))))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.title").value("Unvan bulunamadı"));
    }

    @Test
    void unvanSilinebilir() throws Exception {
        Long id = unvanOlustur("Silinecek Unvan");

        mockMvc.perform(delete("/api/organization/job-titles/" + id))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/organization/job-titles"))
                .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    void olmayanUnvanSilinemezVe404Doner() throws Exception {
        mockMvc.perform(delete("/api/organization/job-titles/999999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.title").value("Unvan bulunamadı"));
    }

    @Test
    void bosIsimliUnvanOlusturulamazVe400Doner() throws Exception {
        mockMvc.perform(post("/api/organization/job-titles")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new JobTitleRequest("  "))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.title").value("Geçersiz istek"));
    }

    private Long unvanOlustur(String name) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/organization/job-titles")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new JobTitleRequest(name))))
                .andExpect(status().isCreated())
                .andReturn();
        return objectMapper.readTree(result.getResponse().getContentAsString()).get("id").asLong();
    }
}
