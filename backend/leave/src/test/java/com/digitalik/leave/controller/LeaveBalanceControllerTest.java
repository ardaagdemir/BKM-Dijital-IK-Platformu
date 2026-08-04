package com.digitalik.leave.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.digitalik.leave.dto.CreateLeaveRequestRequest;
import com.digitalik.leave.dto.LeaveRequestDecisionRequest;
import com.digitalik.leave.dto.LeaveTypeRequest;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.LocalDate;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

/**
 * US-04.1.3/US-04.2.3 kabul kriteri: "Bakiye = hak ediş - kullanılan - onay
 * bekleyen; her işlemde güncellenir." Kullanılan (APPROVED) ve onay bekleyen
 * (PENDING) artık gerçek {@code LeaveRequest} kayıtlarından hesaplanıyor.
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class LeaveBalanceControllerTest {

    private static final Long EMPLOYEE_ID = 42L;

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void hicTalepYokkenBakiyeHakEdiseEsittir() throws Exception {
        mockMvc.perform(get("/api/leave/balance")
                        .param("employeeId", EMPLOYEE_ID.toString())
                        .param("hireDate", "2020-01-01")
                        .param("asOfDate", "2026-01-01"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.yearsOfService").value(6))
                .andExpect(jsonPath("$.entitlementDays").value(20))
                .andExpect(jsonPath("$.usedDays").value(0))
                .andExpect(jsonPath("$.pendingDays").value(0))
                .andExpect(jsonPath("$.remainingDays").value(20));
    }

    /** US-04.2.3 kabul kriteri: "onaylanan izni bakiyeden düşmek." */
    @Test
    void onaylananTalepKullanilanaSayilirVeBakiyedenDuser() throws Exception {
        Long leaveTypeId = izinTuruOlustur();
        Long requestId = izinTalebiOlustur(leaveTypeId, LocalDate.of(2026, 8, 3), LocalDate.of(2026, 8, 7)); // 5 gün

        mockMvc.perform(put("/api/leave/requests/" + requestId + "/decision")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LeaveRequestDecisionRequest("APPROVED", null))))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/leave/balance")
                        .param("employeeId", EMPLOYEE_ID.toString())
                        .param("hireDate", "2020-01-01")
                        .param("asOfDate", "2026-01-01"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.entitlementDays").value(20))
                .andExpect(jsonPath("$.usedDays").value(5))
                .andExpect(jsonPath("$.pendingDays").value(0))
                .andExpect(jsonPath("$.remainingDays").value(15));
    }

    /** Kabul kriteri: bakiye formülünde "onay bekleyen" ayrı bir kalemdir. */
    @Test
    void bekleyenTalepOnayBekleyeneSayilirAmaKullanilanaSayilmaz() throws Exception {
        Long leaveTypeId = izinTuruOlustur();
        izinTalebiOlustur(leaveTypeId, LocalDate.of(2026, 8, 3), LocalDate.of(2026, 8, 7)); // 5 gün, PENDING kalır

        mockMvc.perform(get("/api/leave/balance")
                        .param("employeeId", EMPLOYEE_ID.toString())
                        .param("hireDate", "2020-01-01")
                        .param("asOfDate", "2026-01-01"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.usedDays").value(0))
                .andExpect(jsonPath("$.pendingDays").value(5))
                .andExpect(jsonPath("$.remainingDays").value(15));
    }

    /** Kabul kriteri: reddedilen izin ne kullanılana ne bekleyene sayılmamalı. */
    @Test
    void reddedilenTalepBakiyeyiEtkilemez() throws Exception {
        Long leaveTypeId = izinTuruOlustur();
        Long requestId = izinTalebiOlustur(leaveTypeId, LocalDate.of(2026, 8, 3), LocalDate.of(2026, 8, 7));

        mockMvc.perform(put("/api/leave/requests/" + requestId + "/decision")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LeaveRequestDecisionRequest("REJECTED", "Uygun değil."))))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/leave/balance")
                        .param("employeeId", EMPLOYEE_ID.toString())
                        .param("hireDate", "2020-01-01")
                        .param("asOfDate", "2026-01-01"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.usedDays").value(0))
                .andExpect(jsonPath("$.pendingDays").value(0))
                .andExpect(jsonPath("$.remainingDays").value(20));
    }

    @Test
    void employeeIdOlmadanIstekYapilamazVe400Doner() throws Exception {
        mockMvc.perform(get("/api/leave/balance").param("hireDate", "2020-01-01"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail").value("Çalışan boş olamaz."));
    }

    @Test
    void hireDateOlmadanIstekYapilamazVe400Doner() throws Exception {
        mockMvc.perform(get("/api/leave/balance").param("employeeId", EMPLOYEE_ID.toString()))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail").value("İşe giriş tarihi boş olamaz."));
    }

    @Test
    void asOfDateVerilmezseBugunKullanilir() throws Exception {
        mockMvc.perform(get("/api/leave/balance")
                        .param("employeeId", EMPLOYEE_ID.toString())
                        .param("hireDate", "2010-01-01"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.asOfDate").exists())
                .andExpect(jsonPath("$.remainingDays").value(26));
    }

    private Long izinTuruOlustur() throws Exception {
        MvcResult result = mockMvc.perform(post("/api/leave/types")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LeaveTypeRequest("Yıllık İzin", "YILLIK"))))
                .andExpect(status().isCreated())
                .andReturn();
        return objectMapper.readTree(result.getResponse().getContentAsString()).get("id").asLong();
    }

    private Long izinTalebiOlustur(Long leaveTypeId, LocalDate startDate, LocalDate endDate) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/leave/requests")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new CreateLeaveRequestRequest(EMPLOYEE_ID, leaveTypeId, startDate, endDate))))
                .andExpect(status().isCreated())
                .andReturn();
        return objectMapper.readTree(result.getResponse().getContentAsString()).get("id").asLong();
    }
}
