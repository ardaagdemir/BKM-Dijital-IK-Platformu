package com.digitalik.payroll.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.digitalik.attendance.dto.AssignWorkModelRequest;
import com.digitalik.attendance.dto.AttendanceRecordRequest;
import com.digitalik.attendance.dto.ImportAttendanceRecordsRequest;
import com.digitalik.attendance.dto.WorkModelRequest;
import com.digitalik.leave.dto.CreateLeaveRequestRequest;
import com.digitalik.leave.dto.LeaveRequestDecisionRequest;
import com.digitalik.leave.dto.LeaveTypeRequest;
import com.digitalik.travel.dto.CreateTravelRequestRequest;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

/**
 * US-08D.1.2 kabul kriteri: "Bordro kullanıcısı olarak, onaylanmış izin/
 * PDKS/masraf verisini tek ekranda görmek istiyorum. Ekran, ilgili
 * modüllerden yalnızca onaylanmış kayıtları okur."
 *
 * <p>US-08D.1.3 kabul kriteri: "... hazırlanan bordro verisini Excel/CSV
 * olarak dışa aktarmak istiyorum. Dosya, dış bordro sistemine
 * aktarılabilir formatta üretilir." — bkz. {@code
 * dosyaOnayliVerileriDoguRuSatirlarlaIcerir}.
 *
 * <p>Bu test sınıfı, {@code payroll}'ın US-08D.1.2'de kurulan GERÇEK
 * Maven bağımlılığı (leave/attendance/travel) sayesinde mümkün — bkz.
 * {@code PayrollTestApplication}'ın genişletilmiş tarama kapsamı.
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class PayrollConsolidationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private long createApprovedLeaveRequest(long employeeId, LocalDate start, LocalDate end) throws Exception {
        String ltBody = mockMvc.perform(post("/api/leave/types")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LeaveTypeRequest("Yıllık İzin " + employeeId, "Y" + employeeId))))
                .andReturn()
                .getResponse()
                .getContentAsString();
        long leaveTypeId = objectMapper.readTree(ltBody).get("id").asLong();

        String lrBody = mockMvc.perform(post("/api/leave/requests")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new CreateLeaveRequestRequest(employeeId, leaveTypeId, start, end))))
                .andReturn()
                .getResponse()
                .getContentAsString();
        long leaveRequestId = objectMapper.readTree(lrBody).get("id").asLong();

        mockMvc.perform(put("/api/leave/requests/{id}/decision", leaveRequestId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new LeaveRequestDecisionRequest("APPROVED", null))));

        return leaveRequestId;
    }

    private void assignWorkModelAndRecordAttendance(long employeeId, OffsetDateTime checkIn, OffsetDateTime checkOut)
            throws Exception {
        String wmBody = mockMvc.perform(post("/api/attendance/work-models")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new WorkModelRequest("Tam Zamanlı " + employeeId, LocalTime.of(9, 0), LocalTime.of(17, 0)))))
                .andReturn()
                .getResponse()
                .getContentAsString();
        long workModelId = objectMapper.readTree(wmBody).get("id").asLong();

        mockMvc.perform(put("/api/attendance/employees/{employeeId}/work-model-assignment", employeeId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new AssignWorkModelRequest(workModelId))));

        mockMvc.perform(post("/api/attendance/attendance-records")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new ImportAttendanceRecordsRequest(
                        List.of(new AttendanceRecordRequest(employeeId, checkIn, checkOut))))));
    }

    private long createApprovedExpenseItem(long employeeId) throws Exception {
        String trBody = mockMvc.perform(post("/api/travel/requests")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new CreateTravelRequestRequest(
                                employeeId, "İstanbul", LocalDate.of(2026, 8, 1), LocalDate.of(2026, 8, 3), "Toplantı"))))
                .andReturn()
                .getResponse()
                .getContentAsString();
        long travelRequestId = objectMapper.readTree(trBody).get("id").asLong();

        MockMultipartFile document =
                new MockMultipartFile("document", "fatura.txt", "text/plain", "fatura içeriği".getBytes());
        String expBody = mockMvc.perform(multipart("/api/travel/requests/{travelRequestId}/expense-items", travelRequestId)
                        .file(document)
                        .param("amount", "250.00"))
                .andReturn()
                .getResponse()
                .getContentAsString();
        long expenseItemId = objectMapper.readTree(expBody).get("id").asLong();

        mockMvc.perform(put("/api/travel/requests/{travelRequestId}/expense-items/{id}/decision", travelRequestId, expenseItemId)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"decision\":\"APPROVED\"}"));

        return expenseItemId;
    }

    @Test
    void ekranYalnizcaOnaylanmisKayitlariOkur() throws Exception {
        long employeeId = 200L;
        createApprovedLeaveRequest(employeeId, LocalDate.of(2026, 8, 10), LocalDate.of(2026, 8, 10));
        assignWorkModelAndRecordAttendance(
                employeeId,
                OffsetDateTime.of(2026, 8, 5, 9, 0, 0, 0, ZoneOffset.UTC),
                OffsetDateTime.of(2026, 8, 5, 17, 0, 0, 0, ZoneOffset.UTC));
        createApprovedExpenseItem(employeeId);

        mockMvc.perform(get("/api/payroll/consolidation")
                        .param("employeeId", String.valueOf(employeeId))
                        .param("year", "2026")
                        .param("month", "8"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.employeeId").value(employeeId))
                .andExpect(jsonPath("$.approvedLeaveRequests.length()").value(1))
                .andExpect(jsonPath("$.approvedLeaveRequests[0].requestedDays").value(1))
                .andExpect(jsonPath("$.timesheet.length()").value(31))
                .andExpect(jsonPath("$.approvedExpenseItems.length()").value(1))
                .andExpect(jsonPath("$.approvedExpenseItems[0].amount").value(250.00));
    }

    @Test
    void onaylanmamisMasrafKalemiEkrandaGorunmez() throws Exception {
        long employeeId = 201L;
        String trBody = mockMvc.perform(post("/api/travel/requests")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new CreateTravelRequestRequest(
                                employeeId, "Ankara", LocalDate.of(2026, 8, 1), LocalDate.of(2026, 8, 2), "Eğitim"))))
                .andReturn()
                .getResponse()
                .getContentAsString();
        long travelRequestId = objectMapper.readTree(trBody).get("id").asLong();
        MockMultipartFile document =
                new MockMultipartFile("document", "fatura.txt", "text/plain", "fatura içeriği".getBytes());
        mockMvc.perform(multipart("/api/travel/requests/{travelRequestId}/expense-items", travelRequestId)
                .file(document)
                .param("amount", "100.00"));
        // Karara bağlanmadı — PENDING kalıyor.

        mockMvc.perform(get("/api/payroll/consolidation")
                        .param("employeeId", String.valueOf(employeeId))
                        .param("year", "2026")
                        .param("month", "8"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.approvedExpenseItems.length()").value(0));
    }

    @Test
    void calismaModeliAtanmamisCalisanIcinPuantajBosDoner() throws Exception {
        mockMvc.perform(get("/api/payroll/consolidation")
                        .param("employeeId", "999999")
                        .param("year", "2026")
                        .param("month", "8"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.timesheet.length()").value(0))
                .andExpect(jsonPath("$.approvedLeaveRequests.length()").value(0))
                .andExpect(jsonPath("$.approvedExpenseItems.length()").value(0));
    }

    @Test
    void employeeIdOlmadanReddedilirVe400Doner() throws Exception {
        mockMvc.perform(get("/api/payroll/consolidation").param("year", "2026").param("month", "8"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail").value("Çalışan boş olamaz."));
    }

    @Test
    void dosyaOnayliVerileriDoguRuSatirlarlaIcerir() throws Exception {
        long employeeId = 202L;
        createApprovedLeaveRequest(employeeId, LocalDate.of(2026, 8, 12), LocalDate.of(2026, 8, 12));
        assignWorkModelAndRecordAttendance(
                employeeId,
                OffsetDateTime.of(2026, 8, 5, 9, 0, 0, 0, ZoneOffset.UTC),
                OffsetDateTime.of(2026, 8, 5, 17, 0, 0, 0, ZoneOffset.UTC));
        createApprovedExpenseItem(employeeId);

        String csv = mockMvc.perform(get("/api/payroll/consolidation/export")
                        .param("employeeId", String.valueOf(employeeId))
                        .param("year", "2026")
                        .param("month", "8"))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        List<String> lines = csv.lines().toList();
        assertEquals("kayit_turu,tarih,aciklama,deger,birim", lines.get(0));
        assertTrue(lines.stream().anyMatch(line -> line.startsWith("IZIN,2026-08-12") && line.endsWith(",1,gun")));
        assertTrue(lines.stream().anyMatch(line -> line.contains("MASRAF") && line.endsWith(",250.00,TL")));
        assertTrue(lines.stream().anyMatch(line -> line.startsWith("PUANTAJ,2026-08-01")));
    }

    @Test
    void disaAktarmaContentDispositionHeaderTasir() throws Exception {
        mockMvc.perform(get("/api/payroll/consolidation/export")
                        .param("employeeId", "203")
                        .param("year", "2026")
                        .param("month", "8"))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Disposition", "attachment; filename=\"bordro-203-2026-8.csv\""));
    }
}
