package com.digitalik.organization.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.digitalik.organization.dto.AssignEmployeeRequest;
import com.digitalik.organization.dto.CreateEmployeeRequest;
import com.digitalik.organization.dto.CreateOrganizationUnitRequest;
import com.digitalik.organization.dto.JobTitleRequest;
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
 * US-03.4.1 kabul kriteri: "Değişiklik anında eski atama kapatılır (bitiş
 * tarihi), yeni atama açılır; geçmiş liste olarak görüntülenir."
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class EmployeeAssignmentHistoryControllerTest {

    private static final String GECERLI_TC_NO = "10000000146";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void ilkAtamaTekBirAcikGecmisKaydiOlusturur() throws Exception {
        Long employeeId = calisanOlustur();
        Long unitId = birimOlustur("ABC Şirketi");
        Long jobTitleId = unvanOlustur("Yazılım Mühendisi");

        ata(employeeId, unitId, jobTitleId);

        mockMvc.perform(get("/api/organization/employees/" + employeeId + "/assignment-history"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].organizationUnitId").value(unitId))
                .andExpect(jsonPath("$[0].jobTitleId").value(jobTitleId))
                .andExpect(jsonPath("$[0].startDate").exists())
                .andExpect(jsonPath("$[0].endDate").doesNotExist());
    }

    /** Kabul kriteri: "eski atama kapatılır (bitiş tarihi), yeni atama açılır." */
    @Test
    void ikinciAtamaOncekiniKapatirYenisiniAcar() throws Exception {
        Long employeeId = calisanOlustur();
        Long unitId1 = birimOlustur("ABC Şirketi");
        Long jobTitleId1 = unvanOlustur("Yazılım Mühendisi");
        Long unitId2 = birimOlustur("XYZ Şirketi");
        Long jobTitleId2 = unvanOlustur("İK Uzmanı");

        ata(employeeId, unitId1, jobTitleId1);
        ata(employeeId, unitId2, jobTitleId2);

        mockMvc.perform(get("/api/organization/employees/" + employeeId + "/assignment-history"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                // en yeni önce: index 0 = ikinci (açık) atama, index 1 = ilk (kapatılmış) atama
                .andExpect(jsonPath("$[0].organizationUnitId").value(unitId2))
                .andExpect(jsonPath("$[0].jobTitleId").value(jobTitleId2))
                .andExpect(jsonPath("$[0].endDate").doesNotExist())
                .andExpect(jsonPath("$[1].organizationUnitId").value(unitId1))
                .andExpect(jsonPath("$[1].jobTitleId").value(jobTitleId1))
                .andExpect(jsonPath("$[1].endDate").exists());
    }

    /** Kabul kriteri: "geçmiş liste olarak görüntülenir" — üçüncü değişiklikte de geçmiş büyümeye devam eder. */
    @Test
    void ucuncuAtamaGecmisiUceCikarir() throws Exception {
        Long employeeId = calisanOlustur();
        Long unitId = birimOlustur("ABC Şirketi");
        Long jobTitleId1 = unvanOlustur("Yazılım Mühendisi");
        Long jobTitleId2 = unvanOlustur("Kıdemli Yazılım Mühendisi");
        Long jobTitleId3 = unvanOlustur("Takım Lideri");

        ata(employeeId, unitId, jobTitleId1);
        ata(employeeId, unitId, jobTitleId2);
        ata(employeeId, unitId, jobTitleId3);

        mockMvc.perform(get("/api/organization/employees/" + employeeId + "/assignment-history"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(3));
    }

    @Test
    void olmayanCalisaninGecmisiListelenemezVe404Doner() throws Exception {
        mockMvc.perform(get("/api/organization/employees/999999/assignment-history"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.title").value("Çalışan bulunamadı"));
    }

    private void ata(Long employeeId, Long unitId, Long jobTitleId) throws Exception {
        mockMvc.perform(put("/api/organization/employees/" + employeeId + "/assignment")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new AssignEmployeeRequest(unitId, jobTitleId))))
                .andExpect(status().isOk());
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

    private Long birimOlustur(String name) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/organization/units")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new CreateOrganizationUnitRequest(name, null))))
                .andExpect(status().isCreated())
                .andReturn();
        return objectMapper.readTree(result.getResponse().getContentAsString()).get("id").asLong();
    }

    private Long unvanOlustur(String name) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/organization/job-titles")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new JobTitleRequest(name))))
                .andExpect(status().isCreated())
                .andReturn();
        return objectMapper.readTree(result.getResponse().getContentAsString()).get("id").asLong();
    }
}
