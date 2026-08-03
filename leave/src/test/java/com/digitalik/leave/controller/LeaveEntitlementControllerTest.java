package com.digitalik.leave.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

/**
 * US-04.1.2 kabul kriteri: "Hak ediş, işe giriş tarihinden hesaplanan
 * kıdeme göre basit bir kademe tablosuyla belirlenir." Kademeler İş Kanunu
 * m.53 ile aynı: 1 yıldan az → 0, 1-5 yıl (5 dahil) → 14, 5-15 yıl → 20,
 * 15 yıl ve üzeri → 26.
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class LeaveEntitlementControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void birYildanAzHizmetteHakEdisSifirdir() throws Exception {
        mockMvc.perform(get("/api/leave/entitlement")
                        .param("hireDate", "2026-01-01")
                        .param("asOfDate", "2026-06-01"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.yearsOfService").value(0))
                .andExpect(jsonPath("$.entitlementDays").value(0));
    }

    @Test
    void tamBirYilHizmettteHakEdisOnDortGundur() throws Exception {
        mockMvc.perform(get("/api/leave/entitlement")
                        .param("hireDate", "2025-01-01")
                        .param("asOfDate", "2026-01-01"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.yearsOfService").value(1))
                .andExpect(jsonPath("$.entitlementDays").value(14));
    }

    @Test
    void besYilHizmetteHakEdisHalaOnDortGundur() throws Exception {
        mockMvc.perform(get("/api/leave/entitlement")
                        .param("hireDate", "2021-01-01")
                        .param("asOfDate", "2026-01-01"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.yearsOfService").value(5))
                .andExpect(jsonPath("$.entitlementDays").value(14));
    }

    @Test
    void besYildanFazlaOnBesYildanAzHizmettteHakEdisYirmiGundur() throws Exception {
        mockMvc.perform(get("/api/leave/entitlement")
                        .param("hireDate", "2020-01-01")
                        .param("asOfDate", "2026-01-01"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.yearsOfService").value(6))
                .andExpect(jsonPath("$.entitlementDays").value(20));
    }

    @Test
    void onBesYilVeUzeriHizmettteHakEdisYirmiAltiGundur() throws Exception {
        mockMvc.perform(get("/api/leave/entitlement")
                        .param("hireDate", "2010-01-01")
                        .param("asOfDate", "2026-01-01"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.yearsOfService").value(16))
                .andExpect(jsonPath("$.entitlementDays").value(26));
    }

    @Test
    void asOfDateVerilmezseBugunKullanilir() throws Exception {
        mockMvc.perform(get("/api/leave/entitlement").param("hireDate", "2010-01-01"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.asOfDate").exists())
                .andExpect(jsonPath("$.entitlementDays").value(26));
    }

    @Test
    void isTarihiHesaplamaTarihindenSonraOlamazVe400Doner() throws Exception {
        mockMvc.perform(get("/api/leave/entitlement")
                        .param("hireDate", "2027-01-01")
                        .param("asOfDate", "2026-01-01"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail").value("İşe giriş tarihi hesaplama tarihinden sonra olamaz."));
    }

    @Test
    void hireDateOlmadanIstekYapilamazVe400Doner() throws Exception {
        mockMvc.perform(get("/api/leave/entitlement")).andExpect(status().isBadRequest());
    }
}
