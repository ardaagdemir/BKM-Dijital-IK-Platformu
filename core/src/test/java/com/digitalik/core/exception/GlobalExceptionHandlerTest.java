package com.digitalik.core.exception;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.digitalik.core.controller.ThrowingTestController;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

/**
 * US-01.2.2 kabul kriteri: "API hataları tek bir standart JSON yapısıyla döner;
 * frontend bu yapıyı tek bir yerde işler."
 */
@WebMvcTest(controllers = ThrowingTestController.class)
class GlobalExceptionHandlerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void illegalArgumentDurumundaProblemDetailStandartinaUygunYanitDoner() throws Exception {
        mockMvc.perform(get("/test/gecersiz-istek"))
                .andExpect(status().isBadRequest())
                .andExpect(content().contentType(MediaType.APPLICATION_PROBLEM_JSON))
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.title").value("Geçersiz istek"))
                .andExpect(jsonPath("$.detail").value("Zorunlu alan eksik."));
    }

    @Test
    void beklenmeyenHataDurumundaAyniStandartaUygunYanitDoner() throws Exception {
        mockMvc.perform(get("/test/beklenmeyen-hata"))
                .andExpect(status().isInternalServerError())
                .andExpect(content().contentType(MediaType.APPLICATION_PROBLEM_JSON))
                .andExpect(jsonPath("$.status").value(500))
                .andExpect(jsonPath("$.title").value("Sunucu hatası"))
                .andExpect(jsonPath("$.detail").value("Beklenmeyen bir hata oluştu."));
    }
}
