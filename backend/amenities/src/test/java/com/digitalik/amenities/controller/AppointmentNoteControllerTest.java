package com.digitalik.amenities.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.digitalik.amenities.dto.BookAppointmentRequest;
import com.digitalik.amenities.dto.CreateAppointmentSlotRequest;
import com.digitalik.amenities.dto.ServiceOfferingRequest;
import com.digitalik.amenities.dto.UpdateAppointmentNoteRequest;
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
 * US-08H.1.3 kabul kriteri (SEC-020): "Sistem olarak, sağlık verisi
 * içeren randevu notlarını yalnızca yetkili kişilerin görmesini
 * istiyorum. Yetkisiz kullanıcı notu göremez."
 *
 * <p>Bu test sınıfı yalnızca not ekleme/güncelleme (kısıtlanmamış) ve
 * bulunamadı senaryolarını doğrular — {@code GET .../note}'un
 * {@code @PreAuthorize} enforcement'ı, {@code organization}'daki
 * US-03.2.6/US-03.3.4'te olduğu gibi, bu modülün izole test ortamında
 * (`@EnableMethodSecurity` yalnızca tam uygulama bağlamında etkin)
 * gözlemlenemiyor; canlı doğrulama Docker üzerinden yapıldı (bkz.
 * implementation log).
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class AppointmentNoteControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private long createAppointment(long employeeId) throws Exception {
        String serviceBody = mockMvc.perform(post("/api/appointments/services")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new ServiceOfferingRequest("İşyeri Hekimi"))))
                .andReturn()
                .getResponse()
                .getContentAsString();
        long serviceId = objectMapper.readTree(serviceBody).get("id").asLong();

        String slotBody = mockMvc.perform(post("/api/appointments/slots")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new CreateAppointmentSlotRequest(
                                serviceId,
                                OffsetDateTime.of(2026, 11, 1, 9, 0, 0, 0, ZoneOffset.UTC),
                                OffsetDateTime.of(2026, 11, 1, 9, 30, 0, 0, ZoneOffset.UTC)))))
                .andReturn()
                .getResponse()
                .getContentAsString();
        long slotId = objectMapper.readTree(slotBody).get("id").asLong();

        String appointmentBody = mockMvc.perform(post("/api/appointments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new BookAppointmentRequest(slotId, employeeId))))
                .andReturn()
                .getResponse()
                .getContentAsString();
        return objectMapper.readTree(appointmentBody).get("id").asLong();
    }

    @Test
    void notEklenirVeGuncellenir() throws Exception {
        long appointmentId = createAppointment(80L);

        mockMvc.perform(put("/api/appointments/{id}/note", appointmentId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new UpdateAppointmentNoteRequest("Tansiyon takibi öneriliyor."))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.appointmentId").value(appointmentId))
                .andExpect(jsonPath("$.note").value("Tansiyon takibi öneriliyor."));
    }

    @Test
    void olmayanRandevuyaNotEklenemezVe404Doner() throws Exception {
        mockMvc.perform(put("/api/appointments/{id}/note", 999999L)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new UpdateAppointmentNoteRequest("Not"))))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.detail").value("Randevu bulunamadı."));
    }
}
