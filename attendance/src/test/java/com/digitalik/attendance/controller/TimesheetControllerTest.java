package com.digitalik.attendance.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.digitalik.attendance.dto.AssignWorkModelRequest;
import com.digitalik.attendance.dto.AttendanceRecordRequest;
import com.digitalik.attendance.dto.ImportAttendanceRecordsRequest;
import com.digitalik.attendance.dto.WorkModelRequest;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

/**
 * US-07.3.1 kabul kriteri: "İK kullanıcısı olarak, aylık puantajı
 * (normal/eksik/fazla mesai günleri) görmek istiyorum. Puantaj, PDKS
 * verisi + izin verisinden hesaplanır."
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class TimesheetControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void aylikPuantajGunBazindaDogruSiniflandirilir() throws Exception {
        // Planlanan: 09:00-17:00 (480 dk)
        Long workModelId = modelOlustur("Tam Zamanlı", LocalTime.of(9, 0), LocalTime.of(17, 0));
        ataModeli(70L, workModelId);

        kayitEkle(70L, "2026-08-05T09:00:00+03:00", "2026-08-05T17:00:00+03:00"); // NORMAL (480 dk)
        kayitEkle(70L, "2026-08-06T09:00:00+03:00", "2026-08-06T13:00:00+03:00"); // EKSIK (240 dk)
        kayitEkle(70L, "2026-08-07T09:00:00+03:00", "2026-08-07T20:00:00+03:00"); // FAZLA_MESAI (660 dk)
        // 2026-08-08: leaveDates ile İZİNLİ
        // 2026-08-09: hiç kayıt yok -> EKSIK (0 dk)

        mockMvc.perform(get("/api/attendance/timesheet")
                        .param("employeeId", "70")
                        .param("year", "2026")
                        .param("month", "8")
                        .param("leaveDates", "2026-08-08"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.employeeId").value(70))
                .andExpect(jsonPath("$.days.length()").value(31))
                .andExpect(jsonPath("$.days[4].date").value("2026-08-05"))
                .andExpect(jsonPath("$.days[4].status").value("NORMAL"))
                .andExpect(jsonPath("$.days[4].workedMinutes").value(480))
                .andExpect(jsonPath("$.days[5].status").value("EKSIK"))
                .andExpect(jsonPath("$.days[5].workedMinutes").value(240))
                .andExpect(jsonPath("$.days[6].status").value("FAZLA_MESAI"))
                .andExpect(jsonPath("$.days[6].workedMinutes").value(660))
                .andExpect(jsonPath("$.days[7].status").value("IZINLI"))
                .andExpect(jsonPath("$.days[7].workedMinutes").doesNotExist())
                .andExpect(jsonPath("$.days[8].status").value("EKSIK"))
                .andExpect(jsonPath("$.days[8].workedMinutes").value(0));
    }

    @Test
    void atamaYapilmamisCalisanIcinPuantajHesaplanamazVe404Doner() throws Exception {
        mockMvc.perform(get("/api/attendance/timesheet")
                        .param("employeeId", "999999")
                        .param("year", "2026")
                        .param("month", "8"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.title").value("Çalışma modeli ataması bulunamadı"));
    }

    @Test
    void employeeIdOlmadanReddedilirVe400Doner() throws Exception {
        mockMvc.perform(get("/api/attendance/timesheet").param("year", "2026").param("month", "8"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail").value("Çalışan boş olamaz."));
    }

    @Test
    void gecersizAyReddedilirVe400Doner() throws Exception {
        Long workModelId = modelOlustur("Tam Zamanlı", LocalTime.of(9, 0), LocalTime.of(17, 0));
        ataModeli(71L, workModelId);

        mockMvc.perform(get("/api/attendance/timesheet")
                        .param("employeeId", "71")
                        .param("year", "2026")
                        .param("month", "13"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail").value("Ay 1 ile 12 arasında olmalıdır."));
    }

    private Long modelOlustur(String name, LocalTime start, LocalTime end) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/attendance/work-models")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new WorkModelRequest(name, start, end))))
                .andExpect(status().isCreated())
                .andReturn();
        return objectMapper.readTree(result.getResponse().getContentAsString()).get("id").asLong();
    }

    private void ataModeli(Long employeeId, Long workModelId) throws Exception {
        mockMvc.perform(put("/api/attendance/employees/" + employeeId + "/work-model-assignment")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new AssignWorkModelRequest(workModelId))))
                .andExpect(status().isOk());
    }

    private void kayitEkle(Long employeeId, String checkIn, String checkOut) throws Exception {
        mockMvc.perform(post("/api/attendance/attendance-records")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new ImportAttendanceRecordsRequest(List.of(
                                new AttendanceRecordRequest(
                                        employeeId, OffsetDateTime.parse(checkIn), OffsetDateTime.parse(checkOut)))))))
                .andExpect(status().isCreated());
    }
}
