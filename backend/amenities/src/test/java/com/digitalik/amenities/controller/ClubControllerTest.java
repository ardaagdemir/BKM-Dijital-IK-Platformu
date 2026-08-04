package com.digitalik.amenities.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.digitalik.amenities.dto.ClubRequest;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

/**
 * US-08G.1.1 kabul kriteri: "Çalışan olarak, kulüpleri görüntüleyip..."
 * — kulüplerin görüntülenebilmesi için önce tanımlanabilmesi gerekiyor.
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class ClubControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void kulupOlusturulurVeListelenir() throws Exception {
        mockMvc.perform(post("/api/clubs")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new ClubRequest("Koşu Kulübü", null))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.name").value("Koşu Kulübü"));

        mockMvc.perform(get("/api/clubs"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].name").value("Koşu Kulübü"));
    }

    @Test
    void kulupGuncellenir() throws Exception {
        String body = mockMvc.perform(post("/api/clubs")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new ClubRequest("Fotoğrafçılık Kulübü", null))))
                .andReturn()
                .getResponse()
                .getContentAsString();
        long id = objectMapper.readTree(body).get("id").asLong();

        mockMvc.perform(put("/api/clubs/{id}", id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new ClubRequest("E-spor Kulübü", 30L))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("E-spor Kulübü"))
                .andExpect(jsonPath("$.leaderId").value(30));
    }

    @Test
    void kulupSilinir() throws Exception {
        String body = mockMvc.perform(post("/api/clubs")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new ClubRequest("Müzik/Sanat Kulübü", null))))
                .andReturn()
                .getResponse()
                .getContentAsString();
        long id = objectMapper.readTree(body).get("id").asLong();

        mockMvc.perform(delete("/api/clubs/{id}", id)).andExpect(status().isNoContent());

        mockMvc.perform(get("/api/clubs"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    void bosIsimReddedilirVe400Doner() throws Exception {
        mockMvc.perform(post("/api/clubs")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new ClubRequest("  ", null))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail").value("Kulüp adı boş olamaz."));
    }

    @Test
    void olmayanKulupGuncellenemezVe404Doner() throws Exception {
        mockMvc.perform(put("/api/clubs/{id}", 999999L)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new ClubRequest("Yeni ad", null))))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.detail").value("Kulüp bulunamadı."));
    }
}
