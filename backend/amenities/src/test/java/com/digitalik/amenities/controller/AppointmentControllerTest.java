package com.digitalik.amenities.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.digitalik.amenities.dto.BookAppointmentRequest;
import com.digitalik.amenities.dto.CreateAppointmentSlotRequest;
import com.digitalik.amenities.dto.ServiceOfferingRequest;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

/**
 * US-08H.1.2 kabul kriteri: "Çalışan olarak, uygun bir slota randevu
 * almak istiyorum. Aynı saatte ikinci randevu engellenir."
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class AppointmentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private long createService(String name) throws Exception {
        String body = mockMvc.perform(post("/api/appointments/services")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new ServiceOfferingRequest(name))))
                .andReturn()
                .getResponse()
                .getContentAsString();
        return objectMapper.readTree(body).get("id").asLong();
    }

    private long createSlot(long serviceId, OffsetDateTime start, OffsetDateTime end) throws Exception {
        String body = mockMvc.perform(post("/api/appointments/slots")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new CreateAppointmentSlotRequest(serviceId, start, end))))
                .andReturn()
                .getResponse()
                .getContentAsString();
        return objectMapper.readTree(body).get("id").asLong();
    }

    @Test
    void uygunSlotaRandevuAlinir() throws Exception {
        long serviceId = createService("İşyeri Hekimi");
        long slotId = createSlot(
                serviceId,
                OffsetDateTime.of(2026, 10, 1, 9, 0, 0, 0, ZoneOffset.UTC),
                OffsetDateTime.of(2026, 10, 1, 9, 30, 0, 0, ZoneOffset.UTC));

        mockMvc.perform(post("/api/appointments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new BookAppointmentRequest(slotId, 60L))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.slotId").value(slotId))
                .andExpect(jsonPath("$.employeeId").value(60));
    }

    @Test
    void ayniSlotIkinciKezAlinamazVe400Doner() throws Exception {
        long serviceId = createService("Diyetisyen");
        long slotId = createSlot(
                serviceId,
                OffsetDateTime.of(2026, 10, 2, 10, 0, 0, 0, ZoneOffset.UTC),
                OffsetDateTime.of(2026, 10, 2, 10, 30, 0, 0, ZoneOffset.UTC));
        mockMvc.perform(post("/api/appointments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new BookAppointmentRequest(slotId, 61L))))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/api/appointments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new BookAppointmentRequest(slotId, 62L))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail").value("Bu slot zaten dolu."));
    }

    @Test
    void ayniCalisanAyniSaatDilimindeIkinciRandevuAlamazVe400Doner() throws Exception {
        long serviceA = createService("Psikolojik Danışmanlık");
        long serviceB = createService("Wellbeing");
        long slotA = createSlot(
                serviceA,
                OffsetDateTime.of(2026, 10, 3, 11, 0, 0, 0, ZoneOffset.UTC),
                OffsetDateTime.of(2026, 10, 3, 11, 30, 0, 0, ZoneOffset.UTC));
        // Farklı bir hizmetin, kısmen kesişen (11:15-11:45) bir slotu.
        long slotB = createSlot(
                serviceB,
                OffsetDateTime.of(2026, 10, 3, 11, 15, 0, 0, ZoneOffset.UTC),
                OffsetDateTime.of(2026, 10, 3, 11, 45, 0, 0, ZoneOffset.UTC));

        mockMvc.perform(post("/api/appointments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new BookAppointmentRequest(slotA, 63L))))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/api/appointments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new BookAppointmentRequest(slotB, 63L))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail").value("Aynı saat diliminde başka bir randevunuz var."));
    }

    @Test
    void farkliCalisanlarCakismayanSlotlaraRandevuAlabilir() throws Exception {
        long serviceId = createService("Eğitim/Atölye");
        long slotId1 = createSlot(
                serviceId,
                OffsetDateTime.of(2026, 10, 4, 9, 0, 0, 0, ZoneOffset.UTC),
                OffsetDateTime.of(2026, 10, 4, 9, 30, 0, 0, ZoneOffset.UTC));
        long slotId2 = createSlot(
                serviceId,
                OffsetDateTime.of(2026, 10, 4, 9, 30, 0, 0, ZoneOffset.UTC),
                OffsetDateTime.of(2026, 10, 4, 10, 0, 0, 0, ZoneOffset.UTC));

        mockMvc.perform(post("/api/appointments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new BookAppointmentRequest(slotId1, 64L))))
                .andExpect(status().isCreated());
        mockMvc.perform(post("/api/appointments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new BookAppointmentRequest(slotId2, 65L))))
                .andExpect(status().isCreated());
    }

    @Test
    void olmayanSlotaRandevuAlinamazVe404Doner() throws Exception {
        mockMvc.perform(post("/api/appointments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new BookAppointmentRequest(999999L, 66L))))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.detail").value("Slot bulunamadı."));
    }

    @Test
    void calisaninKendiRandevulariListelenir() throws Exception {
        long serviceId = createService("İK Buluşmaları");
        long slotId = createSlot(
                serviceId,
                OffsetDateTime.of(2026, 10, 5, 13, 0, 0, 0, ZoneOffset.UTC),
                OffsetDateTime.of(2026, 10, 5, 13, 30, 0, 0, ZoneOffset.UTC));
        mockMvc.perform(post("/api/appointments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new BookAppointmentRequest(slotId, 67L))))
                .andExpect(status().isCreated());

        mockMvc.perform(get("/api/appointments").param("employeeId", "67"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].slotId").value(slotId));
    }

    @Test
    void employeeIdOlmadanListelemeReddedilirVe400Doner() throws Exception {
        mockMvc.perform(get("/api/appointments"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail").value("Çalışan boş olamaz."));
    }
}
