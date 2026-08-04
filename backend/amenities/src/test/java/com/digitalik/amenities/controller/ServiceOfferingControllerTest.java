package com.digitalik.amenities.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.digitalik.amenities.dto.ServiceOfferingRequest;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

/**
 * US-08H.1.1 kabul kriteri: "Sistem yöneticisi olarak, hizmet ... tanımlamak istiyorum."
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class ServiceOfferingControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void hizmetOlusturulurVeListelenir() throws Exception {
        mockMvc.perform(post("/api/appointments/services")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new ServiceOfferingRequest("İşyeri Hekimi"))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.name").value("İşyeri Hekimi"));

        mockMvc.perform(get("/api/appointments/services"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].name").value("İşyeri Hekimi"));
    }

    @Test
    void hizmetGuncellenir() throws Exception {
        String body = mockMvc.perform(post("/api/appointments/services")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new ServiceOfferingRequest("Diyetisyen"))))
                .andReturn()
                .getResponse()
                .getContentAsString();
        long id = objectMapper.readTree(body).get("id").asLong();

        mockMvc.perform(put("/api/appointments/services/{id}", id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new ServiceOfferingRequest("Psikolojik Danışmanlık"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Psikolojik Danışmanlık"));
    }

    @Test
    void hizmetSilinir() throws Exception {
        String body = mockMvc.perform(post("/api/appointments/services")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new ServiceOfferingRequest("Eğitim/Atölye"))))
                .andReturn()
                .getResponse()
                .getContentAsString();
        long id = objectMapper.readTree(body).get("id").asLong();

        mockMvc.perform(delete("/api/appointments/services/{id}", id)).andExpect(status().isNoContent());

        mockMvc.perform(get("/api/appointments/services"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    void bosIsimReddedilirVe400Doner() throws Exception {
        mockMvc.perform(post("/api/appointments/services")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new ServiceOfferingRequest("  "))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail").value("Hizmet adı boş olamaz."));
    }

    @Test
    void olmayanHizmetGuncellenemezVe404Doner() throws Exception {
        mockMvc.perform(put("/api/appointments/services/{id}", 999999L)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new ServiceOfferingRequest("Yeni ad"))))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.detail").value("Hizmet bulunamadı."));
    }
}
