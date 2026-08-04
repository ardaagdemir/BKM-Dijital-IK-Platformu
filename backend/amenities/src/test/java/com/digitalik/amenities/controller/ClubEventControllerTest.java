package com.digitalik.amenities.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.digitalik.amenities.dto.ClubRequest;
import com.digitalik.amenities.dto.CreateClubEventRequest;
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
 * US-08G.1.2 kabul kriteri: "Kulüp Lideri olarak, etkinlik oluşturmak
 * istiyorum. Etkinlik yalnızca lider tarafından oluşturulabilir."
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class ClubEventControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private long createClub(String name, Long leaderId) throws Exception {
        String body = mockMvc.perform(post("/api/clubs")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new ClubRequest(name, leaderId))))
                .andReturn()
                .getResponse()
                .getContentAsString();
        return objectMapper.readTree(body).get("id").asLong();
    }

    @Test
    void liderEtkinlikOlusturabilir() throws Exception {
        long clubId = createClub("Koşu Kulübü", 100L);

        mockMvc.perform(post("/api/clubs/events")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new CreateClubEventRequest(clubId, 100L, "Hafta Sonu Koşusu", LocalDate.of(2026, 9, 5)))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.clubId").value(clubId))
                .andExpect(jsonPath("$.name").value("Hafta Sonu Koşusu"))
                .andExpect(jsonPath("$.date").value("2026-09-05"));
    }

    @Test
    void liderOlmayanEtkinlikOlusturamazVe403Doner() throws Exception {
        long clubId = createClub("Fotoğrafçılık Kulübü", 101L);

        mockMvc.perform(post("/api/clubs/events")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new CreateClubEventRequest(clubId, 102L, "Fotoğraf Gezisi", LocalDate.of(2026, 9, 10)))))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.detail").value("Yalnızca kulüp lideri etkinlik oluşturabilir."));
    }

    @Test
    void liderAtanmamisKulupteHicKimseEtkinlikOlusturamazVe403Doner() throws Exception {
        long clubId = createClub("E-spor Kulübü", null);

        mockMvc.perform(post("/api/clubs/events")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new CreateClubEventRequest(clubId, 103L, "Turnuva", LocalDate.of(2026, 9, 15)))))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.detail").value("Yalnızca kulüp lideri etkinlik oluşturabilir."));
    }

    @Test
    void olmayanKulupteEtkinlikOlusturulamazVe404Doner() throws Exception {
        mockMvc.perform(post("/api/clubs/events")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new CreateClubEventRequest(999999L, 100L, "Etkinlik", LocalDate.of(2026, 9, 20)))))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.detail").value("Kulüp bulunamadı."));
    }

    @Test
    void bosEtkinlikAdiReddedilirVe400Doner() throws Exception {
        long clubId = createClub("Gönüllülük Kulübü", 104L);

        mockMvc.perform(post("/api/clubs/events")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new CreateClubEventRequest(clubId, 104L, "  ", LocalDate.of(2026, 9, 25)))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail").value("Etkinlik adı boş olamaz."));
    }

    @Test
    void kaydedilenEtkinlikKulubunListesindeGeriOkunur() throws Exception {
        long clubId = createClub("Trekking Kulübü", 105L);
        mockMvc.perform(post("/api/clubs/events")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new CreateClubEventRequest(clubId, 105L, "Dağ Yürüyüşü", LocalDate.of(2026, 10, 1)))))
                .andExpect(status().isCreated());

        mockMvc.perform(get("/api/clubs/events").param("clubId", String.valueOf(clubId)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].name").value("Dağ Yürüyüşü"));
    }
}
