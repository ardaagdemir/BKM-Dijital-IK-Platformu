package com.digitalik.payroll.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.digitalik.payroll.dto.PayrollItemRequest;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

/**
 * US-08D.1.1 kabul kriteri: "Bordro kullanıcısı olarak, temel ücret
 * kalemlerini (maaş, kesinti) tanımlamak istiyorum. Kalem tanımı basit
 * bir referans listesidir."
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class PayrollItemControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void ucretKalemiOlusturulurVeListelenir() throws Exception {
        mockMvc.perform(post("/api/payroll/items")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new PayrollItemRequest("Temel Ücret", "Maaş"))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.name").value("Temel Ücret"))
                .andExpect(jsonPath("$.type").value("Maaş"));

        mockMvc.perform(get("/api/payroll/items"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].name").value("Temel Ücret"));
    }

    @Test
    void ucretKalemiGuncellenir() throws Exception {
        String body = mockMvc.perform(post("/api/payroll/items")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new PayrollItemRequest("Nafaka Kesintisi", "Kesinti"))))
                .andReturn()
                .getResponse()
                .getContentAsString();
        long id = objectMapper.readTree(body).get("id").asLong();

        mockMvc.perform(put("/api/payroll/items/{id}", id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new PayrollItemRequest("İcra Kesintisi", "Kesinti"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("İcra Kesintisi"));
    }

    @Test
    void ucretKalemiSilinir() throws Exception {
        String body = mockMvc.perform(post("/api/payroll/items")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new PayrollItemRequest("Yemek Yardımı", "Yan Hak"))))
                .andReturn()
                .getResponse()
                .getContentAsString();
        long id = objectMapper.readTree(body).get("id").asLong();

        mockMvc.perform(delete("/api/payroll/items/{id}", id)).andExpect(status().isNoContent());

        mockMvc.perform(get("/api/payroll/items"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    void bosAdReddedilirVe400Doner() throws Exception {
        mockMvc.perform(post("/api/payroll/items")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new PayrollItemRequest("  ", "Maaş"))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail").value("Kalem adı boş olamaz."));
    }

    @Test
    void bosTurReddedilirVe400Doner() throws Exception {
        mockMvc.perform(post("/api/payroll/items")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new PayrollItemRequest("Prim", "  "))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail").value("Kalem türü boş olamaz."));
    }

    @Test
    void olmayanKalemGuncellenemezVe404Doner() throws Exception {
        mockMvc.perform(put("/api/payroll/items/{id}", 999999L)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new PayrollItemRequest("Yeni ad", "Maaş"))))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.detail").value("Ücret kalemi bulunamadı."));
    }
}
