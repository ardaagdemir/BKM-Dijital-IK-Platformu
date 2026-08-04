package com.digitalik.amenities.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.digitalik.amenities.dto.ClubMembershipDecisionRequest;
import com.digitalik.amenities.dto.ClubRequest;
import com.digitalik.amenities.dto.CreateClubMembershipRequestRequest;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

/**
 * US-08G.1.1 kabul kriteri: "Çalışan olarak, kulüpleri görüntüleyip üyelik
 * talebi oluşturmak istiyorum. Talep İK onayına gider."
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class ClubMembershipRequestControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private long createClub(String name) throws Exception {
        String body = mockMvc.perform(post("/api/clubs")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new ClubRequest(name, null))))
                .andReturn()
                .getResponse()
                .getContentAsString();
        return objectMapper.readTree(body).get("id").asLong();
    }

    private long createRequest(long clubId, long employeeId) throws Exception {
        String body = mockMvc.perform(post("/api/clubs/membership-requests")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new CreateClubMembershipRequestRequest(clubId, employeeId))))
                .andReturn()
                .getResponse()
                .getContentAsString();
        return objectMapper.readTree(body).get("id").asLong();
    }

    @Test
    void uyelikTalebiPendingDurumundaOlusturulur() throws Exception {
        long clubId = createClub("Koşu Kulübü");

        mockMvc.perform(post("/api/clubs/membership-requests")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new CreateClubMembershipRequestRequest(clubId, 80L))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.clubId").value(clubId))
                .andExpect(jsonPath("$.employeeId").value(80))
                .andExpect(jsonPath("$.status").value("PENDING"));
    }

    @Test
    void ikOnayiIleTalepOnaylanir() throws Exception {
        long clubId = createClub("Fotoğrafçılık Kulübü");
        long requestId = createRequest(clubId, 81L);

        mockMvc.perform(put("/api/clubs/membership-requests/{id}/decision", requestId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new ClubMembershipDecisionRequest("APPROVED", null))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("APPROVED"));
    }

    @Test
    void gerekcesizRetReddedilirVe400Doner() throws Exception {
        long clubId = createClub("E-spor Kulübü");
        long requestId = createRequest(clubId, 82L);

        mockMvc.perform(put("/api/clubs/membership-requests/{id}/decision", requestId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new ClubMembershipDecisionRequest("REJECTED", null))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail").value("Ret gerekçesi zorunludur."));
    }

    @Test
    void gerekceliRetKabulEdilir() throws Exception {
        long clubId = createClub("Gönüllülük Kulübü");
        long requestId = createRequest(clubId, 83L);

        mockMvc.perform(put("/api/clubs/membership-requests/{id}/decision", requestId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new ClubMembershipDecisionRequest("REJECTED", "Kontenjan dolu."))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("REJECTED"))
                .andExpect(jsonPath("$.rejectionReason").value("Kontenjan dolu."));
    }

    @Test
    void zatenKararaBaglanmisTalepTekrarKararaBaglanamazVe400Doner() throws Exception {
        long clubId = createClub("Müzik/Sanat Kulübü");
        long requestId = createRequest(clubId, 84L);
        mockMvc.perform(put("/api/clubs/membership-requests/{id}/decision", requestId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new ClubMembershipDecisionRequest("APPROVED", null))));

        mockMvc.perform(put("/api/clubs/membership-requests/{id}/decision", requestId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new ClubMembershipDecisionRequest("APPROVED", null))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail").value("Bu talep zaten karara bağlanmış."));
    }

    @Test
    void olmayanKulupleTalepOlusturulamazVe404Doner() throws Exception {
        mockMvc.perform(post("/api/clubs/membership-requests")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new CreateClubMembershipRequestRequest(999999L, 85L))))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.detail").value("Kulüp bulunamadı."));
    }

    @Test
    void olmayanTalepKararaBaglanamazVe404Doner() throws Exception {
        mockMvc.perform(put("/api/clubs/membership-requests/{id}/decision", 999999L)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new ClubMembershipDecisionRequest("APPROVED", null))))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.detail").value("Üyelik talebi bulunamadı."));
    }

    @Test
    void calisaninKendiTalepleriListelenir() throws Exception {
        long clubId = createClub("Trekking Kulübü");
        createRequest(clubId, 86L);

        mockMvc.perform(get("/api/clubs/membership-requests").param("employeeId", "86"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].employeeId").value(86));
    }

    @Test
    void employeeIdOlmadanListelemeTumTalepleriDoner() throws Exception {
        long clubId = createClub("Gönüllülük Kulübü");
        createRequest(clubId, 87L);
        createRequest(clubId, 88L);

        mockMvc.perform(get("/api/clubs/membership-requests"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2));
    }
}
