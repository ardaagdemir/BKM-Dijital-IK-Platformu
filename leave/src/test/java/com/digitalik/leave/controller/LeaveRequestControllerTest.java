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
 * US-04.2.1 kabul kriteri: "Form; yetersiz bakiyede uyarı gösterir
 * (engellemeyebilir)."
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class LeaveRequestControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void izinTalebiOlusturulurVeBekliyorDurumundadir() throws Exception {
        Long leaveTypeId = izinTuruOlustur("Yıllık İzin", "YILLIK");

        mockMvc.perform(post("/api/leave/requests")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new CreateLeaveRequestRequest(1L, leaveTypeId, LocalDate.of(2026, 8, 3), LocalDate.of(2026, 8, 7)))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.employeeId").value(1))
                .andExpect(jsonPath("$.leaveTypeId").value(leaveTypeId))
                .andExpect(jsonPath("$.status").value("PENDING"))
                .andExpect(jsonPath("$.requestedDays").value(5))
                .andExpect(jsonPath("$.balanceWarning").doesNotExist());
    }

    /** Kabul kriteri: "yetersiz bakiyede uyarı gösterir." */
    @Test
    void yetersizBakiyedeUyariGosterilirAmaEngellenMez() throws Exception {
        Long leaveTypeId = izinTuruOlustur("Yıllık İzin", "YILLIK");
        // 6 yıl hizmet → bakiye 20 gün (bkz. LeaveEntitlementService); 25 gün talep edilecek.
        LocalDate hireDate = LocalDate.now().minusYears(6);

        mockMvc.perform(post("/api/leave/requests")
                        .queryParam("hireDate", hireDate.toString())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new CreateLeaveRequestRequest(
                                1L, leaveTypeId, LocalDate.now().plusDays(10), LocalDate.now().plusDays(34)))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.requestedDays").value(25))
                .andExpect(jsonPath("$.status").value("PENDING"))
                .andExpect(jsonPath("$.balanceWarning").value("Bakiye yetersiz: kalan 20 gün, talep edilen 25 gün."));
    }

    @Test
    void hireDateVerilmezseBakiyeKontroluYapilmaz() throws Exception {
        Long leaveTypeId = izinTuruOlustur("Yıllık İzin", "YILLIK");

        mockMvc.perform(post("/api/leave/requests")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new CreateLeaveRequestRequest(
                                1L, leaveTypeId, LocalDate.now().plusDays(10), LocalDate.now().plusDays(60)))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.balanceWarning").doesNotExist());
    }

    /** US-04.3.1: employeeEmail sağlanırsa yanıtta ve karar sonrasında da görünür kalır. */
    @Test
    void ePostaAdresiSaglanirsaYanitlardaGorunur() throws Exception {
        Long leaveTypeId = izinTuruOlustur("Yıllık İzin", "YILLIK");

        MvcResult createResult = mockMvc.perform(post("/api/leave/requests")
                        .queryParam("employeeEmail", "calisan@dijitalik.local")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new CreateLeaveRequestRequest(1L, leaveTypeId, LocalDate.of(2026, 8, 3), LocalDate.of(2026, 8, 7)))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.employeeEmail").value("calisan@dijitalik.local"))
                .andReturn();
        Long requestId =
                objectMapper.readTree(createResult.getResponse().getContentAsString()).get("id").asLong();

        mockMvc.perform(put("/api/leave/requests/" + requestId + "/decision")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LeaveRequestDecisionRequest("APPROVED", null))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.employeeEmail").value("calisan@dijitalik.local"));
    }

    @Test
    void ePostaAdresiSaglanmazsaNullDoner() throws Exception {
        Long leaveTypeId = izinTuruOlustur("Yıllık İzin", "YILLIK");

        mockMvc.perform(post("/api/leave/requests")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new CreateLeaveRequestRequest(1L, leaveTypeId, LocalDate.of(2026, 8, 3), LocalDate.of(2026, 8, 7)))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.employeeEmail").doesNotExist());
    }

    @Test
    void olmayanIzinTuruyleTalepOlusturulamazVe404Doner() throws Exception {
        mockMvc.perform(post("/api/leave/requests")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new CreateLeaveRequestRequest(1L, 999999L, LocalDate.of(2026, 8, 3), LocalDate.of(2026, 8, 7)))))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.title").value("İzin türü bulunamadı"));
    }

    @Test
    void bitisTarihiBaslangictanOnceOlamazVe400Doner() throws Exception {
        Long leaveTypeId = izinTuruOlustur("Yıllık İzin", "YILLIK");

        mockMvc.perform(post("/api/leave/requests")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new CreateLeaveRequestRequest(1L, leaveTypeId, LocalDate.of(2026, 8, 7), LocalDate.of(2026, 8, 3)))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail").value("Bitiş tarihi başlangıç tarihinden önce olamaz."));
    }

    @Test
    void calisanOlmadanTalepOlusturulamazVe400Doner() throws Exception {
        Long leaveTypeId = izinTuruOlustur("Yıllık İzin", "YILLIK");

        mockMvc.perform(post("/api/leave/requests")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new CreateLeaveRequestRequest(
                                null, leaveTypeId, LocalDate.of(2026, 8, 3), LocalDate.of(2026, 8, 7)))))
                .andExpect(status().isBadRequest());
    }

    /** US-04.2.2 kabul kriteri (durum geçişi kısmı — ekip kısıtı @PreAuthorize seviyesinde, bkz. LeaveRequestAccessGuardTest). */
    @Test
    void talepOnaylanabilir() throws Exception {
        Long leaveTypeId = izinTuruOlustur("Yıllık İzin", "YILLIK");
        Long requestId = izinTalebiOlustur(leaveTypeId);

        mockMvc.perform(put("/api/leave/requests/" + requestId + "/decision")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LeaveRequestDecisionRequest("APPROVED", null))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("APPROVED"));
    }

    /** Kabul kriteri: "ret gerekçesi zorunlu." */
    @Test
    void talepGerekceyleReddedilebilir() throws Exception {
        Long leaveTypeId = izinTuruOlustur("Yıllık İzin", "YILLIK");
        Long requestId = izinTalebiOlustur(leaveTypeId);

        mockMvc.perform(put("/api/leave/requests/" + requestId + "/decision")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new LeaveRequestDecisionRequest("REJECTED", "Yoğun dönem, uygun değil."))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("REJECTED"))
                .andExpect(jsonPath("$.rejectionReason").value("Yoğun dönem, uygun değil."));
    }

    @Test
    void gerekcesizRetYapilamazVe400Doner() throws Exception {
        Long leaveTypeId = izinTuruOlustur("Yıllık İzin", "YILLIK");
        Long requestId = izinTalebiOlustur(leaveTypeId);

        mockMvc.perform(put("/api/leave/requests/" + requestId + "/decision")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LeaveRequestDecisionRequest("REJECTED", null))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail").value("Ret gerekçesi zorunludur."));
    }

    @Test
    void zatenKararaBaglanmisTalepTekrarKararaBaglanamazVe400Doner() throws Exception {
        Long leaveTypeId = izinTuruOlustur("Yıllık İzin", "YILLIK");
        Long requestId = izinTalebiOlustur(leaveTypeId);

        mockMvc.perform(put("/api/leave/requests/" + requestId + "/decision")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LeaveRequestDecisionRequest("APPROVED", null))))
                .andExpect(status().isOk());

        mockMvc.perform(put("/api/leave/requests/" + requestId + "/decision")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LeaveRequestDecisionRequest("REJECTED", "Fikir değişti."))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail").value("Bu talep zaten karara bağlanmış."));
    }

    @Test
    void gecersizKararDegeriyle400Doner() throws Exception {
        Long leaveTypeId = izinTuruOlustur("Yıllık İzin", "YILLIK");
        Long requestId = izinTalebiOlustur(leaveTypeId);

        mockMvc.perform(put("/api/leave/requests/" + requestId + "/decision")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LeaveRequestDecisionRequest("FOO", null))))
                .andExpect(status().isBadRequest());
    }

    @Test
    void olmayanTalepKararaBaglanamazVe404Doner() throws Exception {
        mockMvc.perform(put("/api/leave/requests/999999/decision")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LeaveRequestDecisionRequest("APPROVED", null))))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.title").value("İzin talebi bulunamadı"));
    }

    /** US-04.2.4 kabul kriteri: "Liste; durum (bekliyor/onaylı/reddedildi) ile gösterilir." */
    @Test
    void calisaninTalepleriDurumlarlaListelenir() throws Exception {
        Long leaveTypeId = izinTuruOlustur("Yıllık İzin", "YILLIK");
        Long pendingId = izinTalebiOlustur(leaveTypeId, LocalDate.of(2026, 8, 3), LocalDate.of(2026, 8, 7));
        Long approvedId = izinTalebiOlustur(leaveTypeId, LocalDate.of(2026, 9, 1), LocalDate.of(2026, 9, 5));
        Long rejectedId = izinTalebiOlustur(leaveTypeId, LocalDate.of(2026, 10, 1), LocalDate.of(2026, 10, 3));

        mockMvc.perform(put("/api/leave/requests/" + approvedId + "/decision")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LeaveRequestDecisionRequest("APPROVED", null))))
                .andExpect(status().isOk());
        mockMvc.perform(put("/api/leave/requests/" + rejectedId + "/decision")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LeaveRequestDecisionRequest("REJECTED", "Uygun değil."))))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/leave/requests").param("employeeId", "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(3))
                // en yeni (startDate) önce: rejected (Ekim), approved (Eylül), pending (Ağustos)
                .andExpect(jsonPath("$[0].id").value(rejectedId))
                .andExpect(jsonPath("$[0].status").value("REJECTED"))
                .andExpect(jsonPath("$[1].id").value(approvedId))
                .andExpect(jsonPath("$[1].status").value("APPROVED"))
                .andExpect(jsonPath("$[2].id").value(pendingId))
                .andExpect(jsonPath("$[2].status").value("PENDING"));
    }

    @Test
    void baskaCalisaninTalepleriniIcermez() throws Exception {
        Long leaveTypeId = izinTuruOlustur("Yıllık İzin", "YILLIK");
        izinTalebiOlustur(leaveTypeId, LocalDate.of(2026, 8, 3), LocalDate.of(2026, 8, 7)); // employeeId=1

        mockMvc.perform(post("/api/leave/requests")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new CreateLeaveRequestRequest(2L, leaveTypeId, LocalDate.of(2026, 8, 3), LocalDate.of(2026, 8, 7)))))
                .andExpect(status().isCreated());

        mockMvc.perform(get("/api/leave/requests").param("employeeId", "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].employeeId").value(1));
    }

    @Test
    void hicTalebiOlmayanCalisanIcinBosListeDoner() throws Exception {
        mockMvc.perform(get("/api/leave/requests").param("employeeId", "999999"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    void employeeIdOlmadanListelemeYapilamazVe400Doner() throws Exception {
        mockMvc.perform(get("/api/leave/requests"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail").value("Çalışan boş olamaz."));
    }

    private Long izinTalebiOlustur(Long leaveTypeId, LocalDate startDate, LocalDate endDate) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/leave/requests")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new CreateLeaveRequestRequest(1L, leaveTypeId, startDate, endDate))))
                .andExpect(status().isCreated())
                .andReturn();
        return objectMapper.readTree(result.getResponse().getContentAsString()).get("id").asLong();
    }

    private Long izinTalebiOlustur(Long leaveTypeId) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/leave/requests")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new CreateLeaveRequestRequest(1L, leaveTypeId, LocalDate.of(2026, 8, 3), LocalDate.of(2026, 8, 7)))))
                .andExpect(status().isCreated())
                .andReturn();
        return objectMapper.readTree(result.getResponse().getContentAsString()).get("id").asLong();
    }

    private Long izinTuruOlustur(String name, String code) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/leave/types")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LeaveTypeRequest(name, code))))
                .andExpect(status().isCreated())
                .andReturn();
        return objectMapper.readTree(result.getResponse().getContentAsString()).get("id").asLong();
    }
}
