package com.digitalik.organization.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.digitalik.organization.dto.CreateEmployeeRequest;
import com.digitalik.organization.dto.CreateSalaryRecordRequest;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.math.BigDecimal;
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
 * US-03.3.3 kabul kriteri: "Yeni kayıt eskisini silmez; geçmiş liste olarak
 * görüntülenir."
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class EmployeeSalaryRecordControllerTest {

    private static final String GECERLI_TC_NO = "10000000146";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void ucretKaydiOlusturulur() throws Exception {
        Long employeeId = calisanOlustur();

        mockMvc.perform(post("/api/organization/employees/" + employeeId + "/salary-records")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new CreateSalaryRecordRequest(new BigDecimal("45000.00"), LocalDate.of(2026, 1, 15), "İşe giriş"))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.employeeId").value(employeeId))
                .andExpect(jsonPath("$.amount").value(45000.00))
                .andExpect(jsonPath("$.effectiveDate").value("2026-01-15"))
                .andExpect(jsonPath("$.reason").value("İşe giriş"));
    }

    /** Kabul kriteri: "Yeni kayıt eskisini silmez; geçmiş liste olarak görüntülenir." */
    @Test
    void yeniKayitEskisiniSilmezVeGecmisListelenir() throws Exception {
        Long employeeId = calisanOlustur();
        ucretKaydiEkle(employeeId, "45000.00", LocalDate.of(2026, 1, 15), "İşe giriş");
        ucretKaydiEkle(employeeId, "55000.00", LocalDate.of(2026, 7, 1), "Terfi");

        mockMvc.perform(get("/api/organization/employees/" + employeeId + "/salary-records"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].reason").value("Terfi"))
                .andExpect(jsonPath("$[1].reason").value("İşe giriş"));
    }

    @Test
    void sifirVeyaNegatifUcretleKayitOlusturulamazVe400Doner() throws Exception {
        Long employeeId = calisanOlustur();

        mockMvc.perform(post("/api/organization/employees/" + employeeId + "/salary-records")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new CreateSalaryRecordRequest(new BigDecimal("0"), LocalDate.of(2026, 1, 15), null))))
                .andExpect(status().isBadRequest());
    }

    @Test
    void yururlukTarihiOlmadanKayitOlusturulamazVe400Doner() throws Exception {
        Long employeeId = calisanOlustur();

        mockMvc.perform(post("/api/organization/employees/" + employeeId + "/salary-records")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new CreateSalaryRecordRequest(new BigDecimal("45000.00"), null, null))))
                .andExpect(status().isBadRequest());
    }

    @Test
    void olmayanCalisanaUcretKaydiOlusturulamazVe404Doner() throws Exception {
        mockMvc.perform(post("/api/organization/employees/999999/salary-records")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new CreateSalaryRecordRequest(new BigDecimal("45000.00"), LocalDate.of(2026, 1, 15), null))))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.title").value("Çalışan bulunamadı"));
    }

    @Test
    void olmayanCalisaninUcretGecmisiListelenemezVe404Doner() throws Exception {
        mockMvc.perform(get("/api/organization/employees/999999/salary-records"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.title").value("Çalışan bulunamadı"));
    }

    private Long calisanOlustur() throws Exception {
        MvcResult result = mockMvc.perform(post("/api/organization/employees")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new CreateEmployeeRequest(
                                "Ahmet", "Yılmaz", GECERLI_TC_NO, LocalDate.of(2026, 1, 15), "ahmet@dijitalik.local"))))
                .andExpect(status().isCreated())
                .andReturn();
        return objectMapper.readTree(result.getResponse().getContentAsString()).get("id").asLong();
    }

    private void ucretKaydiEkle(Long employeeId, String amount, LocalDate effectiveDate, String reason) throws Exception {
        mockMvc.perform(post("/api/organization/employees/" + employeeId + "/salary-records")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new CreateSalaryRecordRequest(new BigDecimal(amount), effectiveDate, reason))))
                .andExpect(status().isCreated());
    }
}
