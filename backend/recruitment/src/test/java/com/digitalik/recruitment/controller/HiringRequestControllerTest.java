package com.digitalik.recruitment.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.digitalik.recruitment.dto.CreateHiringRequestRequest;
import com.digitalik.recruitment.dto.HiringRequestDecisionRequest;
import com.digitalik.recruitment.dto.StaffingNormRequest;
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
 * US-05.3.1 kabul kriteri: "Talep formu norm kadro kontrolü yapar; norm
 * yoksa engellenir."
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class HiringRequestControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void normKadroTanimliysaTalepOlusturulur() throws Exception {
        normTanimla(1L, 2L, 5);

        mockMvc.perform(post("/api/recruitment/hiring-requests")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new CreateHiringRequestRequest(1L, 2L))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.organizationUnitId").value(1))
                .andExpect(jsonPath("$.jobTitleId").value(2))
                .andExpect(jsonPath("$.status").value("PENDING"));
    }

    /** Kabul kriteri: "norm yoksa engellenir." */
    @Test
    void normKadroTanimliDegilseTalepEngellenirVe404Doner() throws Exception {
        mockMvc.perform(post("/api/recruitment/hiring-requests")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new CreateHiringRequestRequest(1L, 2L))))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.title").value("Norm kadro bulunamadı"))
                .andExpect(jsonPath("$.detail").value("Bu birim/unvan için norm kadro tanımlı değil."));
    }

    @Test
    void farkliBirimUnvanIcinNormTanimliOlmasiYeterliDegildir() throws Exception {
        normTanimla(1L, 2L, 5);

        mockMvc.perform(post("/api/recruitment/hiring-requests")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new CreateHiringRequestRequest(1L, 3L))))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.title").value("Norm kadro bulunamadı"));
    }

    @Test
    void birimOlmadanTalepOlusturulamazVe400Doner() throws Exception {
        mockMvc.perform(post("/api/recruitment/hiring-requests")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new CreateHiringRequestRequest(null, 2L))))
                .andExpect(status().isBadRequest());
    }

    /** US-05.3.2 kabul kriteri: iki aşamalı onay (yönetici → İK) — durum geçişleri. */
    @Test
    void yoneticiOnayindanSonraIkOnayiTalebiTamamenOnaylar() throws Exception {
        Long requestId = talepOlustur();

        mockMvc.perform(put("/api/recruitment/hiring-requests/" + requestId + "/manager-decision")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new HiringRequestDecisionRequest("APPROVED"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("MANAGER_APPROVED"));

        mockMvc.perform(put("/api/recruitment/hiring-requests/" + requestId + "/hr-decision")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new HiringRequestDecisionRequest("APPROVED"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("APPROVED"));
    }

    @Test
    void yoneticiReddederseTalepReddedilir() throws Exception {
        Long requestId = talepOlustur();

        mockMvc.perform(put("/api/recruitment/hiring-requests/" + requestId + "/manager-decision")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new HiringRequestDecisionRequest("REJECTED"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("REJECTED"));
    }

    @Test
    void yoneticiOnayiOlmadanIkKararVeremezVe400Doner() throws Exception {
        Long requestId = talepOlustur();

        mockMvc.perform(put("/api/recruitment/hiring-requests/" + requestId + "/hr-decision")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new HiringRequestDecisionRequest("APPROVED"))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail").value("Bu talep henüz yönetici onayından geçmedi."));
    }

    @Test
    void zatenYoneticiKararinaBaglanmisTalepTekrarKararaBaglanamazVe400Doner() throws Exception {
        Long requestId = talepOlustur();

        mockMvc.perform(put("/api/recruitment/hiring-requests/" + requestId + "/manager-decision")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new HiringRequestDecisionRequest("APPROVED"))))
                .andExpect(status().isOk());

        mockMvc.perform(put("/api/recruitment/hiring-requests/" + requestId + "/manager-decision")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new HiringRequestDecisionRequest("APPROVED"))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail").value("Bu talep zaten yönetici kararına bağlanmış."));
    }

    @Test
    void olmayanTalepKararaBaglanamazVe404Doner() throws Exception {
        mockMvc.perform(put("/api/recruitment/hiring-requests/999999/manager-decision")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new HiringRequestDecisionRequest("APPROVED"))))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.title").value("İşe alım talebi bulunamadı"));
    }

    /** Bölüm 14.4: {@code GET} — {@code organizationUnitId} verilmezse TÜM talepler, verilirse o birimle sınırlı. */
    @Test
    void tumTaleplerListelenir() throws Exception {
        normTanimla(1L, 2L, 5);
        normTanimla(9L, 2L, 3);
        talepOlusturBirim(1L, 2L);
        talepOlusturBirim(9L, 2L);

        mockMvc.perform(get("/api/recruitment/hiring-requests"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2));
    }

    @Test
    void birimeGoreFiltrelenir() throws Exception {
        normTanimla(1L, 2L, 5);
        normTanimla(9L, 2L, 3);
        Long birim1Talep = talepOlusturBirim(1L, 2L);
        talepOlusturBirim(9L, 2L);

        mockMvc.perform(get("/api/recruitment/hiring-requests").param("organizationUnitId", "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].id").value(birim1Talep));
    }

    private Long talepOlusturBirim(Long organizationUnitId, Long jobTitleId) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/recruitment/hiring-requests")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new CreateHiringRequestRequest(organizationUnitId, jobTitleId))))
                .andExpect(status().isCreated())
                .andReturn();
        return objectMapper.readTree(result.getResponse().getContentAsString()).get("id").asLong();
    }

    private Long talepOlustur() throws Exception {
        normTanimla(1L, 2L, 5);
        MvcResult result = mockMvc.perform(post("/api/recruitment/hiring-requests")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new CreateHiringRequestRequest(1L, 2L))))
                .andExpect(status().isCreated())
                .andReturn();
        return objectMapper.readTree(result.getResponse().getContentAsString()).get("id").asLong();
    }

    private void normTanimla(Long organizationUnitId, Long jobTitleId, int normCount) throws Exception {
        mockMvc.perform(put("/api/recruitment/staffing-norms")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new StaffingNormRequest(organizationUnitId, jobTitleId, normCount))))
                .andExpect(status().isOk());
    }
}
