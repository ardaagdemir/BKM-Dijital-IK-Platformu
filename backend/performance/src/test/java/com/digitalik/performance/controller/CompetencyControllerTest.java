package com.digitalik.performance.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.digitalik.performance.dto.CompetencyRequest;
import com.digitalik.performance.dto.GoalRequest;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

/** US-06.1.1 kabul kriteri (yetkinlik tarafı — bkz. GoalControllerTest'teki aynı gerekçe). */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class CompetencyControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void yetkinlikTanimlanabilir() throws Exception {
        mockMvc.perform(post("/api/performance/competencies")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new CompetencyRequest("Takım Çalışması", 50))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.name").value("Takım Çalışması"))
                .andExpect(jsonPath("$.weight").value(50));
    }

    /** Kabul kriteri: "Ağırlık toplamı validasyona tabidir." */
    @Test
    void agirlikToplamiYuzUGecerseEngellenirVe400Doner() throws Exception {
        yetkinlikOlustur("Takım Çalışması", 60);

        mockMvc.perform(post("/api/performance/competencies")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new CompetencyRequest("İletişim", 50))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail").value(
                        "Yetkinliklerin ağırlık toplamı 100'ü geçemez (mevcut toplam: 60, eklenmek istenen: 50)."));
    }

    @Test
    void hedeflerinAgirligiYetkinliklerdenAyriHesaplanir() throws Exception {
        mockMvc.perform(post("/api/performance/goals")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new GoalRequest("Satış Hedefi", 90))))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/api/performance/competencies")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new CompetencyRequest("Takım Çalışması", 90))))
                .andExpect(status().isCreated());
    }

    @Test
    void yetkinlikSilinebilir() throws Exception {
        Long id = yetkinlikOlustur("Silinecek Yetkinlik", 50);

        mockMvc.perform(delete("/api/performance/competencies/" + id)).andExpect(status().isNoContent());

        mockMvc.perform(get("/api/performance/competencies")).andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    void olmayanYetkinlikGuncellenemezVe404Doner() throws Exception {
        mockMvc.perform(put("/api/performance/competencies/999999")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new CompetencyRequest("Hayalet", 10))))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.title").value("Yetkinlik bulunamadı"));
    }

    private Long yetkinlikOlustur(String name, int weight) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/performance/competencies")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new CompetencyRequest(name, weight))))
                .andExpect(status().isCreated())
                .andReturn();
        return objectMapper.readTree(result.getResponse().getContentAsString()).get("id").asLong();
    }
}
