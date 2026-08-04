package com.digitalik.attendance.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.digitalik.attendance.dto.AttendanceRecordRequest;
import com.digitalik.attendance.dto.ImportAttendanceRecordsRequest;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.OffsetDateTime;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

/**
 * US-07.2.1 kabul kriteri: "Sistem olarak, PDKS'ten fiili giriş-çıkış
 * verisini almak istiyorum. Test ortamında örnek veri başarıyla
 * okunur/kaydedilir."
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class AttendanceRecordControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void ornekVeriBasariylaKaydedilirVeOkunur() throws Exception {
        OffsetDateTime checkIn = OffsetDateTime.parse("2026-08-03T08:00:00+03:00");
        OffsetDateTime checkOut = OffsetDateTime.parse("2026-08-03T17:00:00+03:00");

        mockMvc.perform(post("/api/attendance/attendance-records")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new ImportAttendanceRecordsRequest(
                                List.of(new AttendanceRecordRequest(30L, checkIn, checkOut))))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].id").exists())
                .andExpect(jsonPath("$[0].employeeId").value(30));

        mockMvc.perform(get("/api/attendance/attendance-records").param("employeeId", "30"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].employeeId").value(30));
    }

    @Test
    void cikissizKayitKabulEdilir() throws Exception {
        OffsetDateTime checkIn = OffsetDateTime.parse("2026-08-03T08:00:00+03:00");

        mockMvc.perform(post("/api/attendance/attendance-records")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new ImportAttendanceRecordsRequest(
                                List.of(new AttendanceRecordRequest(31L, checkIn, null))))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$[0].checkOutAt").doesNotExist());
    }

    @Test
    void topluIcerAktarimDesteklenir() throws Exception {
        OffsetDateTime checkIn = OffsetDateTime.parse("2026-08-03T08:00:00+03:00");
        OffsetDateTime checkOut = OffsetDateTime.parse("2026-08-03T17:00:00+03:00");

        mockMvc.perform(post("/api/attendance/attendance-records")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new ImportAttendanceRecordsRequest(List.of(
                                new AttendanceRecordRequest(32L, checkIn, checkOut),
                                new AttendanceRecordRequest(33L, checkIn, checkOut))))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.length()").value(2));
    }

    @Test
    void bosListeReddedilirVe400Doner() throws Exception {
        mockMvc.perform(post("/api/attendance/attendance-records")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new ImportAttendanceRecordsRequest(List.of()))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail").value("En az bir kayıt gönderilmelidir."));
    }

    @Test
    void cikisGirisindenOnceOlamazVe400Doner() throws Exception {
        OffsetDateTime checkIn = OffsetDateTime.parse("2026-08-03T17:00:00+03:00");
        OffsetDateTime checkOut = OffsetDateTime.parse("2026-08-03T08:00:00+03:00");

        mockMvc.perform(post("/api/attendance/attendance-records")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new ImportAttendanceRecordsRequest(
                                List.of(new AttendanceRecordRequest(34L, checkIn, checkOut))))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail").value("Çıkış zamanı, giriş zamanından önce olamaz."));
    }

    @Test
    void employeeIdOlmadanListelemeReddedilirVe400Doner() throws Exception {
        mockMvc.perform(get("/api/attendance/attendance-records"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail").value("Çalışan boş olamaz."));
    }

    @Test
    void hicKaydiOlmayanCalisanIcinBosListeDoner() throws Exception {
        mockMvc.perform(get("/api/attendance/attendance-records").param("employeeId", "999999"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }
}
