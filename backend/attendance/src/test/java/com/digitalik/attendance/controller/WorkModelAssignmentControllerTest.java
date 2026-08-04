package com.digitalik.attendance.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.digitalik.attendance.dto.AssignWorkModelRequest;
import com.digitalik.attendance.dto.WorkModelRequest;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.LocalTime;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

/**
 * US-07.1.2 kabul kriteri: "İK kullanıcısı olarak, çalışana bir çalışma
 * modeli/vardiya atamak istiyorum. Atama çalışan kaydına bağlanır."
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class WorkModelAssignmentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void calismaModeliCalisanaAtanabilirVeGoruntulenebilir() throws Exception {
        Long workModelId = modelOlustur("Tam Zamanlı");

        mockMvc.perform(put("/api/attendance/employees/10/work-model-assignment")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new AssignWorkModelRequest(workModelId))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.employeeId").value(10))
                .andExpect(jsonPath("$.workModelId").value(workModelId));

        mockMvc.perform(get("/api/attendance/employees/10/work-model-assignment"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.employeeId").value(10))
                .andExpect(jsonPath("$.workModelId").value(workModelId));
    }

    /** Kabul kriteri dolaylı gereği: bir çalışanın en fazla bir güncel ataması olur — tekrar atama günceller. */
    @Test
    void tekrarAtamaMevcutAtamayiGunceller() throws Exception {
        Long tamZamanli = modelOlustur("Tam Zamanlı");
        Long vardiyali = modelOlustur("Vardiyalı");

        mockMvc.perform(put("/api/attendance/employees/11/work-model-assignment")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new AssignWorkModelRequest(tamZamanli))))
                .andExpect(status().isOk());

        mockMvc.perform(put("/api/attendance/employees/11/work-model-assignment")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new AssignWorkModelRequest(vardiyali))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.workModelId").value(vardiyali));

        mockMvc.perform(get("/api/attendance/employees/11/work-model-assignment"))
                .andExpect(jsonPath("$.workModelId").value(vardiyali));
    }

    @Test
    void atamaYapilmadanGoruntulenemezVe404Doner() throws Exception {
        mockMvc.perform(get("/api/attendance/employees/999999/work-model-assignment"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.title").value("Çalışma modeli ataması bulunamadı"));
    }

    @Test
    void olmayanCalismaModeliAtanamazVe404Doner() throws Exception {
        mockMvc.perform(put("/api/attendance/employees/12/work-model-assignment")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new AssignWorkModelRequest(999999L))))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.title").value("Çalışma modeli bulunamadı"));
    }

    private Long modelOlustur(String name) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/attendance/work-models")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new WorkModelRequest(name, LocalTime.of(9, 0), LocalTime.of(18, 0)))))
                .andExpect(status().isCreated())
                .andReturn();
        return objectMapper.readTree(result.getResponse().getContentAsString()).get("id").asLong();
    }
}
