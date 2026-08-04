package com.digitalik.organization.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.digitalik.organization.dto.CreateEmployeeRequest;
import com.digitalik.platform.customfield.CustomFieldDefinitionService;
import com.digitalik.platform.customfield.CustomFieldType;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.LocalDate;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

/**
 * US-09.5.1'in {@code organization} tarafı — roadmap'in kendi örneği
 * (FR-406) doğrultusunda, {@code platform.customfield}'da admin tarafından
 * TANIMLANMIŞ bir alanın ({@code CustomFieldDefinitionService} ile burada
 * doğrudan seed ediliyor — gerçek akışta {@code
 * platform.customfield.CustomFieldDefinitionController} üzerinden yapılır)
 * bir çalışan için değerinin okunup yazılabildiğini doğrular.
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class EmployeeCustomFieldControllerTest {

    private static final String GECERLI_TC_NO = "10000000146";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private CustomFieldDefinitionService customFieldDefinitionService;

    private Long calisanOlustur() throws Exception {
        String body = mockMvc.perform(post("/api/organization/employees")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new CreateEmployeeRequest(
                                "Ahmet", "Yılmaz", GECERLI_TC_NO, LocalDate.of(2026, 1, 15), "ahmet@dijitalik.local"))))
                .andReturn()
                .getResponse()
                .getContentAsString();
        return objectMapper.readTree(body).get("id").asLong();
    }

    @Test
    void tanimliAlanIcinDegerYoksaBosDoner() throws Exception {
        customFieldDefinitionService.create("Employee", "yabanciDilSeviyesi", CustomFieldType.SELECT, "A1,A2,B1,B2,C1,C2", false);
        Long employeeId = calisanOlustur();

        mockMvc.perform(get("/api/organization/employees/" + employeeId + "/custom-fields"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].fieldName").value("yabanciDilSeviyesi"))
                .andExpect(jsonPath("$[0].value").doesNotExist());
    }

    @Test
    void degerYazilirVeGeriOkunur() throws Exception {
        customFieldDefinitionService.create("Employee", "yabanciDilSeviyesi", CustomFieldType.SELECT, "A1,A2,B1,B2,C1,C2", false);
        Long employeeId = calisanOlustur();

        mockMvc.perform(put("/api/organization/employees/" + employeeId + "/custom-fields")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("yabanciDilSeviyesi", "B2"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].value").value("B2"));

        mockMvc.perform(get("/api/organization/employees/" + employeeId + "/custom-fields"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].value").value("B2"));
    }

    @Test
    void gecersizSecimDegeriReddedilir() throws Exception {
        customFieldDefinitionService.create("Employee", "yabanciDilSeviyesi", CustomFieldType.SELECT, "A1,A2,B1,B2,C1,C2", false);
        Long employeeId = calisanOlustur();

        mockMvc.perform(put("/api/organization/employees/" + employeeId + "/custom-fields")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("yabanciDilSeviyesi", "Z9"))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail").value("yabanciDilSeviyesi geçerli bir seçenek değil."));
    }

    @Test
    void olmayanCalisanIcin404Doner() throws Exception {
        mockMvc.perform(get("/api/organization/employees/999999/custom-fields"))
                .andExpect(status().isNotFound());
    }
}
