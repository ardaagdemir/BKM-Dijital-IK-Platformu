package com.digitalik.amenities.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

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
 * US-08H.1.1 kabul kriteri: "Sistem yöneticisi olarak, hizmet ve uygun
 * saat slotlarını tanımlamak istiyorum. Slot çakışması engellenir."
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class AppointmentSlotControllerTest {

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

    @Test
    void slotOlusturulurVeListelenir() throws Exception {
        long serviceId = createService("İşyeri Hekimi");
        OffsetDateTime start = OffsetDateTime.of(2026, 9, 1, 9, 0, 0, 0, ZoneOffset.UTC);
        OffsetDateTime end = OffsetDateTime.of(2026, 9, 1, 9, 30, 0, 0, ZoneOffset.UTC);

        mockMvc.perform(post("/api/appointments/slots")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new CreateAppointmentSlotRequest(serviceId, start, end))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.serviceOfferingId").value(serviceId));

        mockMvc.perform(get("/api/appointments/slots").param("serviceOfferingId", String.valueOf(serviceId)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));
    }

    @Test
    void cakisanSlotReddedilirVe400Doner() throws Exception {
        long serviceId = createService("Diyetisyen");
        OffsetDateTime start = OffsetDateTime.of(2026, 9, 2, 10, 0, 0, 0, ZoneOffset.UTC);
        OffsetDateTime end = OffsetDateTime.of(2026, 9, 2, 11, 0, 0, 0, ZoneOffset.UTC);
        mockMvc.perform(post("/api/appointments/slots")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new CreateAppointmentSlotRequest(serviceId, start, end))))
                .andExpect(status().isCreated());

        // Kesişen aralık: 10:30-11:30 (var olan 10:00-11:00 ile kesişiyor)
        OffsetDateTime overlappingStart = OffsetDateTime.of(2026, 9, 2, 10, 30, 0, 0, ZoneOffset.UTC);
        OffsetDateTime overlappingEnd = OffsetDateTime.of(2026, 9, 2, 11, 30, 0, 0, ZoneOffset.UTC);
        mockMvc.perform(post("/api/appointments/slots")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new CreateAppointmentSlotRequest(serviceId, overlappingStart, overlappingEnd))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail").value("Bu zaman aralığında çakışan bir slot zaten var."));
    }

    @Test
    void ardArdaGelenCakismayanSlotlarKabulEdilir() throws Exception {
        long serviceId = createService("Wellbeing");
        OffsetDateTime start = OffsetDateTime.of(2026, 9, 3, 9, 0, 0, 0, ZoneOffset.UTC);
        OffsetDateTime end = OffsetDateTime.of(2026, 9, 3, 9, 30, 0, 0, ZoneOffset.UTC);
        mockMvc.perform(post("/api/appointments/slots")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new CreateAppointmentSlotRequest(serviceId, start, end))))
                .andExpect(status().isCreated());

        // Tam olarak bitiş anında başlayan bir sonraki slot — kesişmiyor (yarı açık aralık [start, end)).
        OffsetDateTime nextStart = OffsetDateTime.of(2026, 9, 3, 9, 30, 0, 0, ZoneOffset.UTC);
        OffsetDateTime nextEnd = OffsetDateTime.of(2026, 9, 3, 10, 0, 0, 0, ZoneOffset.UTC);
        mockMvc.perform(post("/api/appointments/slots")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new CreateAppointmentSlotRequest(serviceId, nextStart, nextEnd))))
                .andExpect(status().isCreated());
    }

    @Test
    void farkliHizmetlerinAyniSaattekiSlotlariCakismazSayilir() throws Exception {
        long serviceIdA = createService("İK Buluşmaları");
        long serviceIdB = createService("Eğitim/Atölye");
        OffsetDateTime start = OffsetDateTime.of(2026, 9, 4, 14, 0, 0, 0, ZoneOffset.UTC);
        OffsetDateTime end = OffsetDateTime.of(2026, 9, 4, 15, 0, 0, 0, ZoneOffset.UTC);

        mockMvc.perform(post("/api/appointments/slots")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new CreateAppointmentSlotRequest(serviceIdA, start, end))))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/api/appointments/slots")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new CreateAppointmentSlotRequest(serviceIdB, start, end))))
                .andExpect(status().isCreated());
    }

    @Test
    void baslangicBitistenSonraysaReddedilirVe400Doner() throws Exception {
        long serviceId = createService("Koçluk");
        OffsetDateTime start = OffsetDateTime.of(2026, 9, 5, 11, 0, 0, 0, ZoneOffset.UTC);
        OffsetDateTime end = OffsetDateTime.of(2026, 9, 5, 10, 0, 0, 0, ZoneOffset.UTC);

        mockMvc.perform(post("/api/appointments/slots")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new CreateAppointmentSlotRequest(serviceId, start, end))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail").value("Başlangıç zamanı bitiş zamanından önce olmalıdır."));
    }

    @Test
    void olmayanHizmetleSlotOlusturulamazVe404Doner() throws Exception {
        OffsetDateTime start = OffsetDateTime.of(2026, 9, 6, 9, 0, 0, 0, ZoneOffset.UTC);
        OffsetDateTime end = OffsetDateTime.of(2026, 9, 6, 9, 30, 0, 0, ZoneOffset.UTC);

        mockMvc.perform(post("/api/appointments/slots")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new CreateAppointmentSlotRequest(999999L, start, end))))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.detail").value("Hizmet bulunamadı."));
    }
}
