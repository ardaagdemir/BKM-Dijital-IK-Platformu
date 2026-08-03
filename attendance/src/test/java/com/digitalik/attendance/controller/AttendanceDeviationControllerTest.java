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
 * US-07.2.2 kabul kriteri: "İK kullanıcısı olarak, planlanan vardiya ile
 * fiili giriş-çıkışı karşılaştırıp geç kalma/erken çıkışı görmek istiyorum.
 * Sapma otomatik hesaplanır ve listelenir."
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class AttendanceDeviationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void gecKalmaVeErkenCikisOtomatikHesaplanir() throws Exception {
        Long workModelId = modelOlustur("Tam Zamanlı", LocalTime.of(9, 0), LocalTime.of(18, 0));
        ataModeli(50L, workModelId);
        // 09:20 giriş (20 dk geç), 17:45 çıkış (15 dk erken)
        kayitEkle(50L, OffsetDateTime.parse("2026-08-03T09:20:00+03:00"), OffsetDateTime.parse("2026-08-03T17:45:00+03:00"));

        mockMvc.perform(get("/api/attendance/attendance-records/deviations").param("employeeId", "50"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].lateMinutes").value(20))
                .andExpect(jsonPath("$[0].earlyDepartureMinutes").value(15));
    }

    @Test
    void zamanindaGirisCikistaSapmaSifirDoner() throws Exception {
        Long workModelId = modelOlustur("Tam Zamanlı", LocalTime.of(9, 0), LocalTime.of(18, 0));
        ataModeli(51L, workModelId);
        kayitEkle(51L, OffsetDateTime.parse("2026-08-03T08:55:00+03:00"), OffsetDateTime.parse("2026-08-03T18:10:00+03:00"));

        mockMvc.perform(get("/api/attendance/attendance-records/deviations").param("employeeId", "51"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].lateMinutes").value(0))
                .andExpect(jsonPath("$[0].earlyDepartureMinutes").value(0));
    }

    /** Kabul kriteri dolaylı gereği: henüz çıkışı olmayan bir kayıtta erken çıkış hesaplanamaz. */
    @Test
    void cikissizKayittaErkenCikisNullDoner() throws Exception {
        Long workModelId = modelOlustur("Tam Zamanlı", LocalTime.of(9, 0), LocalTime.of(18, 0));
        ataModeli(52L, workModelId);
        kayitEkle(52L, OffsetDateTime.parse("2026-08-03T09:00:00+03:00"), null);

        mockMvc.perform(get("/api/attendance/attendance-records/deviations").param("employeeId", "52"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].earlyDepartureMinutes").doesNotExist());
    }

    @Test
    void atamaYapilmamisCalisanIcinSapmaHesaplanamazVe404Doner() throws Exception {
        mockMvc.perform(get("/api/attendance/attendance-records/deviations").param("employeeId", "999999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.title").value("Çalışma modeli ataması bulunamadı"));
    }

    @Test
    void employeeIdOlmadanReddedilirVe400Doner() throws Exception {
        mockMvc.perform(get("/api/attendance/attendance-records/deviations"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail").value("Çalışan boş olamaz."));
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

    private void kayitEkle(Long employeeId, OffsetDateTime checkIn, OffsetDateTime checkOut) throws Exception {
        mockMvc.perform(post("/api/attendance/attendance-records")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new ImportAttendanceRecordsRequest(
                                List.of(new AttendanceRecordRequest(employeeId, checkIn, checkOut))))))
                .andExpect(status().isCreated());
    }
}
