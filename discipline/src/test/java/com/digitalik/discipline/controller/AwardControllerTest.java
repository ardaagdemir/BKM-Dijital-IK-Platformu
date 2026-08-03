package com.digitalik.discipline.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.digitalik.discipline.dto.CreateAwardRequest;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

/**
 * US-08C.1.4 kabul kriteri: "Yönetici olarak, ödül kaydı (takdir belgesi,
 * prim vb.) oluşturmak istiyorum. Kayıt çalışana bağlanır."
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class AwardControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void oduluKaydiCalisanaBaglanir() throws Exception {
        mockMvc.perform(post("/api/discipline/awards")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new CreateAwardRequest(70L, "Takdir Belgesi", "Proje teslim sürecindeki üstün gayreti için."))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.employeeId").value(70))
                .andExpect(jsonPath("$.type").value("Takdir Belgesi"))
                .andExpect(jsonPath("$.description").value("Proje teslim sürecindeki üstün gayreti için."));
    }

    @Test
    void kaydedilenOdulGeriOkunur() throws Exception {
        mockMvc.perform(post("/api/discipline/awards")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new CreateAwardRequest(71L, "Prim", "Yılın satış hedefinin aşılması."))))
                .andExpect(status().isCreated());

        mockMvc.perform(get("/api/discipline/awards").param("employeeId", "71"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].type").value("Prim"));
    }

    @Test
    void bosTurReddedilirVe400Doner() throws Exception {
        mockMvc.perform(post("/api/discipline/awards")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new CreateAwardRequest(70L, "  ", "Açıklama"))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail").value("Ödül türü boş olamaz."));
    }

    @Test
    void bosAciklamaReddedilirVe400Doner() throws Exception {
        mockMvc.perform(post("/api/discipline/awards")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new CreateAwardRequest(70L, "Prim", "  "))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail").value("Açıklama boş olamaz."));
    }

    @Test
    void employeeIdOlmadanOlusturmaReddedilirVe400Doner() throws Exception {
        mockMvc.perform(post("/api/discipline/awards")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new CreateAwardRequest(null, "Prim", "Açıklama"))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail").value("Çalışan boş olamaz."));
    }

    @Test
    void employeeIdOlmadanListelemeReddedilirVe400Doner() throws Exception {
        mockMvc.perform(get("/api/discipline/awards"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail").value("Çalışan boş olamaz."));
    }

    @Test
    void hicOduluOlmayanCalisanIcinBosListeDoner() throws Exception {
        mockMvc.perform(get("/api/discipline/awards").param("employeeId", "999999"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }
}
