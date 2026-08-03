package com.digitalik.feedback.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.digitalik.feedback.dto.CreateSuggestionRequest;
import com.digitalik.feedback.dto.SuggestionCategoryRequest;
import com.digitalik.feedback.dto.UpdateSuggestionStatusRequest;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

/**
 * US-08F.1.2 kabul kriteri: "İK kullanıcısı olarak, talebin durumunu
 * (Değerlendirmede/Onaylandı/Tamamlandı) güncellemek istiyorum. Durum
 * değişikliği çalışana görünür."
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class SuggestionStatusControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private long createCategory(String name) throws Exception {
        String body = mockMvc.perform(post("/api/suggestions/categories")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new SuggestionCategoryRequest(name))))
                .andReturn()
                .getResponse()
                .getContentAsString();
        return objectMapper.readTree(body).get("id").asLong();
    }

    private long createSuggestion(long categoryId, long employeeId) throws Exception {
        String body = mockMvc.perform(post("/api/suggestions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new CreateSuggestionRequest(categoryId, "Bir öneri.", employeeId, false))))
                .andReturn()
                .getResponse()
                .getContentAsString();
        return objectMapper.readTree(body).get("id").asLong();
    }

    @Test
    void durumGuncellenirVeCalisaninGorunumundeYansir() throws Exception {
        long categoryId = createCategory("Süreç iyileştirme");
        long suggestionId = createSuggestion(categoryId, 70L);

        mockMvc.perform(put("/api/suggestions/{id}/status", suggestionId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new UpdateSuggestionStatusRequest("APPROVED"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("APPROVED"));

        mockMvc.perform(get("/api/suggestions").param("employeeId", "70"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].status").value("APPROVED"));
    }

    @Test
    void durumTamamlandiyaGuncellenebilir() throws Exception {
        long categoryId = createCategory("Eğitim talebi");
        long suggestionId = createSuggestion(categoryId, 71L);

        mockMvc.perform(put("/api/suggestions/{id}/status", suggestionId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new UpdateSuggestionStatusRequest("COMPLETED"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("COMPLETED"));
    }

    @Test
    void gecersizDurumReddedilirVe400Doner() throws Exception {
        long categoryId = createCategory("Maliyet tasarrufu");
        long suggestionId = createSuggestion(categoryId, 72L);

        mockMvc.perform(put("/api/suggestions/{id}/status", suggestionId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new UpdateSuggestionStatusRequest("REJECTED"))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail").value("Durum yalnızca PENDING, APPROVED veya COMPLETED olabilir."));
    }

    @Test
    void olmayanTalebinDurumuGuncellenemezVe404Doner() throws Exception {
        mockMvc.perform(put("/api/suggestions/{id}/status", 999999L)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new UpdateSuggestionStatusRequest("APPROVED"))))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.detail").value("Talep bulunamadı."));
    }
}
