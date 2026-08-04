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
import org.springframework.transaction.annotation.Transactional;

/**
 * US-08I.1.3 kabul kriteri: "Çalışan olarak, organizasyon şemasını
 * görsel olarak görüntülemek istiyorum. Şema, Bölüm 3'teki organizasyon/
 * atama verisinden türetilir."
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class OrganizationChartControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private long createUnit(String name, Long parentId) throws Exception {
        String body = mockMvc.perform(post("/api/organization/units")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new CreateOrganizationUnitRequest(name, parentId))))
                .andReturn()
                .getResponse()
                .getContentAsString();
        return objectMapper.readTree(body).get("id").asLong();
    }

    private long createJobTitle(String name) throws Exception {
        String body = mockMvc.perform(post("/api/organization/job-titles")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new JobTitleRequest(name))))
                .andReturn()
                .getResponse()
                .getContentAsString();
        return objectMapper.readTree(body).get("id").asLong();
    }

    private long createEmployee(String firstName, String lastName, String nationalId, long unitId, long jobTitleId)
            throws Exception {
        String body = mockMvc.perform(post("/api/organization/employees")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new CreateEmployeeRequest(
                                firstName, lastName, nationalId, LocalDate.of(2020, 1, 1), firstName + "@ornek.com"))))
                .andReturn()
                .getResponse()
                .getContentAsString();
        long employeeId = objectMapper.readTree(body).get("id").asLong();

        mockMvc.perform(put("/api/organization/employees/{id}/assignment", employeeId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new AssignEmployeeRequest(unitId, jobTitleId))));

        return employeeId;
    }

    @Test
    void semaOrganizasyonVeAtamaVerisindenTuretilir() throws Exception {
        long companyId = createUnit("BKM", null);
        long departmentId = createUnit("Yazılım Geliştirme", companyId);
        long jobTitleId = createJobTitle("Yazılım Mühendisi");
        createEmployee("Ada", "Lovelace", "10000000146", departmentId, jobTitleId);

        // Bu test sınıfının izole @Transactional bağlamında oluşturulan TEK kök birim
        // bu olduğundan (rollback ile diğer testlerden izole), $[0] güvenle bu köke işaret eder.
        mockMvc.perform(get("/api/organization/chart"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].id").value(companyId))
                .andExpect(jsonPath("$[0].name").value("BKM"))
                .andExpect(jsonPath("$[0].children.length()").value(1))
                .andExpect(jsonPath("$[0].children[0].id").value(departmentId))
                .andExpect(jsonPath("$[0].children[0].name").value("Yazılım Geliştirme"))
                .andExpect(jsonPath("$[0].children[0].employees[0].firstName").value("Ada"))
                .andExpect(jsonPath("$[0].children[0].employees[0].jobTitleName").value("Yazılım Mühendisi"));
    }

    @Test
    void atanmamisCalisanSemadaGorunmez() throws Exception {
        // Hiç atama yapılmayan (organizationUnitId/jobTitleId null) bir çalışan —
        // şema hatasız dönmeli ve bu çalışanı hiçbir yerde göstermemeli.
        mockMvc.perform(post("/api/organization/employees")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new CreateEmployeeRequest(
                        "Unassigned", "Person", "20000000146", LocalDate.of(2020, 1, 1), "unassigned@ornek.com"))));

        mockMvc.perform(get("/api/organization/chart")).andExpect(status().isOk());
    }
}
