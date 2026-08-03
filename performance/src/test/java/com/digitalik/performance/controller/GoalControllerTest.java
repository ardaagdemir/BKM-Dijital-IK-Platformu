package com.digitalik.performance.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

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

/**
 * US-06.1.1 kabul kriteri: "İK kullanıcısı olarak, hedef/yetkinlik
 * tanımlamak istiyorum (ad, ağırlık). Ağırlık toplamı validasyona tabidir."
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class GoalControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void hedefTanimlanabilir() throws Exception {
        mockMvc.perform(post("/api/performance/goals")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new GoalRequest("Satış Hedefi", 40))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.name").value("Satış Hedefi"))
                .andExpect(jsonPath("$.weight").value(40));
    }

    @Test
    void tumHedeflerListelenir() throws Exception {
        hedefOlustur("Satış Hedefi", 40);
        hedefOlustur("Müşteri Memnuniyeti", 30);

        mockMvc.perform(get("/api/performance/goals"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2));
    }

    /** Kabul kriteri: "Ağırlık toplamı validasyona tabidir." */
    @Test
    void agirlikToplamiYuzUGecerseEngellenirVe400Doner() throws Exception {
        hedefOlustur("Satış Hedefi", 60);
        hedefOlustur("Müşteri Memnuniyeti", 30);

        mockMvc.perform(post("/api/performance/goals")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new GoalRequest("Proje Teslim", 20))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail").value(
                        "Hedeflerin ağırlık toplamı 100'ü geçemez (mevcut toplam: 90, eklenmek istenen: 20)."));
    }

    @Test
    void agirlikToplamiTamYuzOlabilir() throws Exception {
        hedefOlustur("Satış Hedefi", 60);

        mockMvc.perform(post("/api/performance/goals")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new GoalRequest("Proje Teslim", 40))))
                .andExpect(status().isCreated());
    }

    @Test
    void guncellemedeKendiAgirligiToplamaDahilEdilmez() throws Exception {
        Long id = hedefOlustur("Satış Hedefi", 60);
        hedefOlustur("Müşteri Memnuniyeti", 30);

        mockMvc.perform(put("/api/performance/goals/" + id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new GoalRequest("Satış Hedefi", 70))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.weight").value(70));
    }

    @Test
    void sifirVeyaYuzdenBuyukAgirlikReddedilirVe400Doner() throws Exception {
        mockMvc.perform(post("/api/performance/goals")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new GoalRequest("Geçersiz", 0))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail").value("Ağırlık 1 ile 100 arasında olmalıdır."));

        mockMvc.perform(post("/api/performance/goals")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new GoalRequest("Geçersiz", 101))))
                .andExpect(status().isBadRequest());
    }

    @Test
    void hedefSilinebilir() throws Exception {
        Long id = hedefOlustur("Silinecek Hedef", 50);

        mockMvc.perform(delete("/api/performance/goals/" + id)).andExpect(status().isNoContent());

        mockMvc.perform(get("/api/performance/goals")).andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    void olmayanHedefGuncellenemezVe404Doner() throws Exception {
        mockMvc.perform(put("/api/performance/goals/999999")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new GoalRequest("Hayalet", 10))))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.title").value("Hedef bulunamadı"));
    }

    @Test
    void olmayanHedefSilinemezVe404Doner() throws Exception {
        mockMvc.perform(delete("/api/performance/goals/999999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.title").value("Hedef bulunamadı"));
    }

    private Long hedefOlustur(String name, int weight) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/performance/goals")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new GoalRequest(name, weight))))
                .andExpect(status().isCreated())
                .andReturn();
        return objectMapper.readTree(result.getResponse().getContentAsString()).get("id").asLong();
    }
}
