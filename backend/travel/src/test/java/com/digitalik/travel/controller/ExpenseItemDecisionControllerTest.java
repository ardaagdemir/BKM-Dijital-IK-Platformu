package com.digitalik.travel.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.digitalik.travel.dto.CreateTravelRequestRequest;
import com.digitalik.travel.dto.ExpenseItemDecisionRequest;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.LocalDate;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

/**
 * US-08B.1.3 kabul kriteri: "Yönetici olarak, masraf beyanını onaylamak
 * istiyorum. Basit onay adımı; ret gerekçesi zorunlu."
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class ExpenseItemDecisionControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void masrafKalemiOnaylanabilir() throws Exception {
        Long travelRequestId = seyahatTalebiOlustur();
        Long expenseItemId = masrafKalemiOlustur(travelRequestId);

        mockMvc.perform(put("/api/travel/requests/" + travelRequestId + "/expense-items/" + expenseItemId + "/decision")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new ExpenseItemDecisionRequest("APPROVED", null))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("APPROVED"));
    }

    @Test
    void gerekcesizRetReddedilirVe400Doner() throws Exception {
        Long travelRequestId = seyahatTalebiOlustur();
        Long expenseItemId = masrafKalemiOlustur(travelRequestId);

        mockMvc.perform(put("/api/travel/requests/" + travelRequestId + "/expense-items/" + expenseItemId + "/decision")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new ExpenseItemDecisionRequest("REJECTED", null))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail").value("Ret gerekçesi zorunludur."));
    }

    @Test
    void gerekceliRetKabulEdilir() throws Exception {
        Long travelRequestId = seyahatTalebiOlustur();
        Long expenseItemId = masrafKalemiOlustur(travelRequestId);

        mockMvc.perform(put("/api/travel/requests/" + travelRequestId + "/expense-items/" + expenseItemId + "/decision")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new ExpenseItemDecisionRequest("REJECTED", "Belge okunaksız"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("REJECTED"))
                .andExpect(jsonPath("$.rejectionReason").value("Belge okunaksız"));
    }

    @Test
    void karariVerilmisKalemTekrarKararaBaglanamazVe400Doner() throws Exception {
        Long travelRequestId = seyahatTalebiOlustur();
        Long expenseItemId = masrafKalemiOlustur(travelRequestId);

        mockMvc.perform(put("/api/travel/requests/" + travelRequestId + "/expense-items/" + expenseItemId + "/decision")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new ExpenseItemDecisionRequest("APPROVED", null))))
                .andExpect(status().isOk());

        mockMvc.perform(put("/api/travel/requests/" + travelRequestId + "/expense-items/" + expenseItemId + "/decision")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new ExpenseItemDecisionRequest("APPROVED", null))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail").value("Bu kalem zaten karara bağlanmış."));
    }

    @Test
    void olmayanKalemKararaBaglanamazVe404Doner() throws Exception {
        Long travelRequestId = seyahatTalebiOlustur();

        mockMvc.perform(put("/api/travel/requests/" + travelRequestId + "/expense-items/999999/decision")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new ExpenseItemDecisionRequest("APPROVED", null))))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.title").value("Masraf kalemi bulunamadı"));
    }

    private Long seyahatTalebiOlustur() throws Exception {
        MvcResult result = mockMvc.perform(post("/api/travel/requests")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new CreateTravelRequestRequest(
                                50L, "İstanbul", LocalDate.of(2026, 9, 1), LocalDate.of(2026, 9, 5), "Müşteri ziyareti"))))
                .andExpect(status().isCreated())
                .andReturn();
        return objectMapper.readTree(result.getResponse().getContentAsString()).get("id").asLong();
    }

    private Long masrafKalemiOlustur(Long travelRequestId) throws Exception {
        MockMultipartFile document =
                new MockMultipartFile("document", "fatura.pdf", MediaType.APPLICATION_PDF_VALUE, "içerik".getBytes());
        MvcResult result = mockMvc.perform(multipart("/api/travel/requests/" + travelRequestId + "/expense-items")
                        .file(document)
                        .param("amount", "100"))
                .andExpect(status().isCreated())
                .andReturn();
        return objectMapper.readTree(result.getResponse().getContentAsString()).get("id").asLong();
    }
}
