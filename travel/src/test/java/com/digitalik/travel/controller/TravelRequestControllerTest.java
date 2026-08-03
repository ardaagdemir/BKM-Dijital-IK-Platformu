package com.digitalik.travel.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.digitalik.travel.dto.CreateTravelRequestRequest;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.LocalDate;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

/**
 * US-08B.1.1 kabul kriteri: "Çalışan olarak, seyahat talebi oluşturmak
 * istiyorum (lokasyon, tarih, amaç). Form kaydedilir."
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class TravelRequestControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void seyahatTalebiKaydedilir() throws Exception {
        mockMvc.perform(post("/api/travel/requests")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new CreateTravelRequestRequest(
                                20L, "İstanbul", LocalDate.of(2026, 9, 1), LocalDate.of(2026, 9, 5), "Müşteri ziyareti"))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.employeeId").value(20))
                .andExpect(jsonPath("$.location").value("İstanbul"))
                .andExpect(jsonPath("$.startDate").value("2026-09-01"))
                .andExpect(jsonPath("$.endDate").value("2026-09-05"))
                .andExpect(jsonPath("$.purpose").value("Müşteri ziyareti"));
    }

    @Test
    void kaydedilenTalepGeriOkunur() throws Exception {
        mockMvc.perform(post("/api/travel/requests")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new CreateTravelRequestRequest(
                                21L, "Ankara", LocalDate.of(2026, 9, 10), LocalDate.of(2026, 9, 12), "Eğitim katılımı"))))
                .andExpect(status().isCreated());

        mockMvc.perform(get("/api/travel/requests").param("employeeId", "21"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].location").value("Ankara"));
    }

    @Test
    void bosLokasyonReddedilirVe400Doner() throws Exception {
        mockMvc.perform(post("/api/travel/requests")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new CreateTravelRequestRequest(
                                20L, "  ", LocalDate.of(2026, 9, 1), LocalDate.of(2026, 9, 5), "Amaç"))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail").value("Lokasyon boş olamaz."));
    }

    @Test
    void bitisBaslangictanOnceOlamazVe400Doner() throws Exception {
        mockMvc.perform(post("/api/travel/requests")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new CreateTravelRequestRequest(
                                20L, "İstanbul", LocalDate.of(2026, 9, 5), LocalDate.of(2026, 9, 1), "Amaç"))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail").value("Bitiş tarihi başlangıç tarihinden önce olamaz."));
    }

    @Test
    void bosAmacReddedilirVe400Doner() throws Exception {
        mockMvc.perform(post("/api/travel/requests")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new CreateTravelRequestRequest(
                                20L, "İstanbul", LocalDate.of(2026, 9, 1), LocalDate.of(2026, 9, 5), "  "))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail").value("Amaç boş olamaz."));
    }

    @Test
    void employeeIdOlmadanListelemeReddedilirVe400Doner() throws Exception {
        mockMvc.perform(get("/api/travel/requests"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail").value("Çalışan boş olamaz."));
    }

    @Test
    void hicTalebiOlmayanCalisanIcinBosListeDoner() throws Exception {
        mockMvc.perform(get("/api/travel/requests").param("employeeId", "999999"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }
}
