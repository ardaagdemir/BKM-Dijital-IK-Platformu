package com.digitalik.recruitment.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.digitalik.recruitment.dto.StaffingNormRequest;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

/**
 * US-05.1.1 kabul kriteri: "Norm kadro birim+unvan için sayısal olarak
 * tanımlanır."
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class StaffingNormControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void normKadroTanimlanabilir() throws Exception {
        mockMvc.perform(put("/api/recruitment/staffing-norms")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new StaffingNormRequest(1L, 2L, 5))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.organizationUnitId").value(1))
                .andExpect(jsonPath("$.jobTitleId").value(2))
                .andExpect(jsonPath("$.normCount").value(5));
    }

    /** Kabul kriteri örtük olarak "tanımlama" — aynı birim+unvan için tekrar çağrı GÜNCELLER, ikinci kayıt açmaz. */
    @Test
    void ayniBirimVeUnvanIcinTekrarCagrildigindaGuncellenir() throws Exception {
        mockMvc.perform(put("/api/recruitment/staffing-norms")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new StaffingNormRequest(1L, 2L, 5))))
                .andExpect(status().isOk());

        mockMvc.perform(put("/api/recruitment/staffing-norms")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new StaffingNormRequest(1L, 2L, 8))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.normCount").value(8));

        mockMvc.perform(get("/api/recruitment/staffing-norms"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].normCount").value(8));
    }

    @Test
    void farkliBirimVeyaUnvanIcinAyriKayitAcilir() throws Exception {
        mockMvc.perform(put("/api/recruitment/staffing-norms")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new StaffingNormRequest(1L, 2L, 5))))
                .andExpect(status().isOk());

        mockMvc.perform(put("/api/recruitment/staffing-norms")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new StaffingNormRequest(1L, 3L, 2))))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/recruitment/staffing-norms"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2));
    }

    @Test
    void negatifNormSayisiylaTanimlanamazVe400Doner() throws Exception {
        mockMvc.perform(put("/api/recruitment/staffing-norms")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new StaffingNormRequest(1L, 2L, -1))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail").value("Norm kadro sayısı negatif olamaz."));
    }

    @Test
    void birimOlmadanTanimlanamazVe400Doner() throws Exception {
        mockMvc.perform(put("/api/recruitment/staffing-norms")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new StaffingNormRequest(null, 2L, 5))))
                .andExpect(status().isBadRequest());
    }

    @Test
    void sifirNormSayisiTanimlanabilir() throws Exception {
        mockMvc.perform(put("/api/recruitment/staffing-norms")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new StaffingNormRequest(1L, 2L, 0))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.normCount").value(0));
    }
}
