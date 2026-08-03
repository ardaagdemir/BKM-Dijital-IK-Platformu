package com.digitalik.organization.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.digitalik.organization.dto.CreateEmployeeAssetRequest;
import com.digitalik.organization.dto.CreateEmployeeRequest;
import com.digitalik.organization.dto.ReturnEmployeeAssetRequest;
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
 * US-03.3.2 kabul kriteri: "Zimmet listesi çoklu kayıt destekler; teslim/iade
 * tarihi izlenir."
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class EmployeeAssetControllerTest {

    private static final String GECERLI_TC_NO = "10000000146";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void zimmetKaydiOlusturulur() throws Exception {
        Long employeeId = calisanOlustur();

        mockMvc.perform(post("/api/organization/employees/" + employeeId + "/assets")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new CreateEmployeeAssetRequest("Dizüstü Bilgisayar", LocalDate.of(2026, 1, 20)))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.employeeId").value(employeeId))
                .andExpect(jsonPath("$.itemName").value("Dizüstü Bilgisayar"))
                .andExpect(jsonPath("$.deliveredAt").value("2026-01-20"))
                .andExpect(jsonPath("$.returnedAt").doesNotExist());
    }

    /** Kabul kriteri: "çoklu kayıt destekler." */
    @Test
    void birCalisaninBirdenFazlaZimmetKaydiOlabilir() throws Exception {
        Long employeeId = calisanOlustur();
        zimmetOlustur(employeeId, "Dizüstü Bilgisayar", LocalDate.of(2026, 1, 20));
        zimmetOlustur(employeeId, "Telefon", LocalDate.of(2026, 1, 21));

        mockMvc.perform(get("/api/organization/employees/" + employeeId + "/assets"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2));
    }

    /** Kabul kriteri: "iade tarihi izlenir." */
    @Test
    void zimmetIadeEdilebilir() throws Exception {
        Long employeeId = calisanOlustur();
        Long assetId = zimmetOlustur(employeeId, "Dizüstü Bilgisayar", LocalDate.of(2026, 1, 20));

        mockMvc.perform(put("/api/organization/employees/" + employeeId + "/assets/" + assetId + "/return")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new ReturnEmployeeAssetRequest(LocalDate.of(2026, 6, 1)))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.returnedAt").value("2026-06-01"));

        mockMvc.perform(get("/api/organization/employees/" + employeeId + "/assets"))
                .andExpect(jsonPath("$[0].returnedAt").value("2026-06-01"));
    }

    @Test
    void ikinciKezIadeEdilemezVe400Doner() throws Exception {
        Long employeeId = calisanOlustur();
        Long assetId = zimmetOlustur(employeeId, "Dizüstü Bilgisayar", LocalDate.of(2026, 1, 20));

        mockMvc.perform(put("/api/organization/employees/" + employeeId + "/assets/" + assetId + "/return")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new ReturnEmployeeAssetRequest(LocalDate.of(2026, 6, 1)))))
                .andExpect(status().isOk());

        mockMvc.perform(put("/api/organization/employees/" + employeeId + "/assets/" + assetId + "/return")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new ReturnEmployeeAssetRequest(LocalDate.of(2026, 6, 2)))))
                .andExpect(status().isBadRequest());
    }

    @Test
    void teslimTarihindenOnceIadeEdilemezVe400Doner() throws Exception {
        Long employeeId = calisanOlustur();
        Long assetId = zimmetOlustur(employeeId, "Dizüstü Bilgisayar", LocalDate.of(2026, 1, 20));

        mockMvc.perform(put("/api/organization/employees/" + employeeId + "/assets/" + assetId + "/return")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new ReturnEmployeeAssetRequest(LocalDate.of(2026, 1, 1)))))
                .andExpect(status().isBadRequest());
    }

    @Test
    void olmayanZimmetIadeEdilemezVe404Doner() throws Exception {
        Long employeeId = calisanOlustur();

        mockMvc.perform(put("/api/organization/employees/" + employeeId + "/assets/999999/return")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new ReturnEmployeeAssetRequest(LocalDate.of(2026, 6, 1)))))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.title").value("Zimmet kaydı bulunamadı"));
    }

    @Test
    void olmayanCalisanaZimmetOlusturulamazVe404Doner() throws Exception {
        mockMvc.perform(post("/api/organization/employees/999999/assets")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new CreateEmployeeAssetRequest("Dizüstü Bilgisayar", LocalDate.of(2026, 1, 20)))))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.title").value("Çalışan bulunamadı"));
    }

    @Test
    void bosKalemAdiylaZimmetOlusturulamazVe400Doner() throws Exception {
        Long employeeId = calisanOlustur();

        mockMvc.perform(post("/api/organization/employees/" + employeeId + "/assets")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new CreateEmployeeAssetRequest("  ", LocalDate.of(2026, 1, 20)))))
                .andExpect(status().isBadRequest());
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

    private Long zimmetOlustur(Long employeeId, String itemName, LocalDate deliveredAt) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/organization/employees/" + employeeId + "/assets")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new CreateEmployeeAssetRequest(itemName, deliveredAt))))
                .andExpect(status().isCreated())
                .andReturn();
        return objectMapper.readTree(result.getResponse().getContentAsString()).get("id").asLong();
    }
}
