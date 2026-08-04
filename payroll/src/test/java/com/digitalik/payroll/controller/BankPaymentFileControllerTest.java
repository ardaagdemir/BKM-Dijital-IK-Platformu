package com.digitalik.payroll.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.digitalik.organization.dto.CreateEmployeeRequest;
import com.digitalik.organization.dto.CreateSalaryRecordRequest;
import com.digitalik.organization.dto.UpdateIbanRequest;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.math.BigDecimal;
import java.time.LocalDate;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

/**
 * US-09.8.1 kabul kriteri: "Sistem, onaylanmış bordro verisinden banka
 * ödeme dosyası üretir." Bu test sınıfı, {@code payroll}'ın YENİ Maven
 * bağımlılığı ({@code organization}) sayesinde mümkün — {@code
 * PayrollConsolidationControllerTest}'teki (leave/attendance/travel)
 * AYNI desen.
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class BankPaymentFileControllerTest {

    private static final String GECERLI_TC_NO = "10000000146";
    private static final String GECERLI_IBAN = "TR330006100519786457841326";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private long calisanOlusturIbanVeUcretle(String firstName, String nationalId, BigDecimal amount) throws Exception {
        String body = mockMvc.perform(post("/api/organization/employees")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new CreateEmployeeRequest(
                                firstName, "Yılmaz", nationalId, LocalDate.of(2026, 1, 1), firstName.toLowerCase() + "@dijitalik.local"))))
                .andReturn()
                .getResponse()
                .getContentAsString();
        long employeeId = objectMapper.readTree(body).get("id").asLong();

        mockMvc.perform(put("/api/organization/employees/" + employeeId + "/iban")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new UpdateIbanRequest(GECERLI_IBAN))));

        mockMvc.perform(post("/api/organization/employees/" + employeeId + "/salary-records")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(
                        new CreateSalaryRecordRequest(amount, LocalDate.of(2026, 1, 1), "İşe giriş ücreti"))));

        return employeeId;
    }

    @Test
    void ibaniVeUcretiOlanCalisanDosyayaDahilEdilir() throws Exception {
        calisanOlusturIbanVeUcretle("Ahmet", GECERLI_TC_NO, new BigDecimal("35000.00"));

        String csv = mockMvc.perform(get("/api/payroll/bank-payment-file").param("year", "2026").param("month", "1"))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Disposition", "attachment; filename=\"banka-odeme-2026-01.csv\""))
                .andReturn()
                .getResponse()
                .getContentAsString();

        assertThat(csv).contains("calisan_id,iban,tutar,aciklama");
        assertThat(csv).contains(GECERLI_IBAN);
        assertThat(csv).contains("35000.00");
        assertThat(csv).contains("2026-01 bordro ödemesi");
    }

    @Test
    void ibaniOlmayanCalisanDosyayaDahilEdilmez() throws Exception {
        String body = mockMvc.perform(post("/api/organization/employees")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new CreateEmployeeRequest(
                                "Mehmet", "Demir", "12345678950", LocalDate.of(2026, 1, 1), "mehmet@dijitalik.local"))))
                .andReturn()
                .getResponse()
                .getContentAsString();
        long employeeId = objectMapper.readTree(body).get("id").asLong();
        mockMvc.perform(post("/api/organization/employees/" + employeeId + "/salary-records")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(
                        new CreateSalaryRecordRequest(new BigDecimal("30000.00"), LocalDate.of(2026, 1, 1), null))));

        String csv = mockMvc.perform(get("/api/payroll/bank-payment-file").param("year", "2026").param("month", "1"))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        assertThat(csv).doesNotContain(String.valueOf(employeeId) + ",");
    }

    @Test
    void donemdenSonraYururlugeGirenUcretKullanilmaz() throws Exception {
        long employeeId = calisanOlusturIbanVeUcretle("Ayşe", "20000000046", new BigDecimal("20000.00"));
        mockMvc.perform(post("/api/organization/employees/" + employeeId + "/salary-records")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(
                        new CreateSalaryRecordRequest(new BigDecimal("40000.00"), LocalDate.of(2026, 6, 1), "Zam"))));

        String csv = mockMvc.perform(get("/api/payroll/bank-payment-file").param("year", "2026").param("month", "2"))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        assertThat(csv).contains("20000.00");
        assertThat(csv).doesNotContain("40000.00");
    }
}
