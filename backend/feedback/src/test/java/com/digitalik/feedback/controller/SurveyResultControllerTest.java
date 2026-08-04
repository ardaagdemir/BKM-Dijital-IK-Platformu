package com.digitalik.feedback.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.digitalik.feedback.dto.CreateSurveyRequest;
import com.digitalik.feedback.dto.SubmitSurveyAnswerRequest;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

/**
 * US-08E.1.3 kabul kriteri: "İK kullanıcısı olarak, anket sonuçlarını
 * yüzdesel dağılımla görmek istiyorum. Sonuç ekranı seçenek bazlı yüzde
 * gösterir."
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class SurveyResultControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private JsonNode createSurvey(String question, List<String> options) throws Exception {
        String body = mockMvc.perform(post("/api/surveys")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new CreateSurveyRequest(question, options, false))))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();
        return objectMapper.readTree(body);
    }

    private void answer(long surveyId, long optionId, long employeeId) throws Exception {
        mockMvc.perform(post("/api/surveys/{surveyId}/answers", surveyId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new SubmitSurveyAnswerRequest(optionId, employeeId))))
                .andExpect(status().isCreated());
    }

    @Test
    void sonucEkraniSecenekBazliYuzdeGosterir() throws Exception {
        JsonNode survey = createSurvey("Ofise dönüş sıklığı?", List.of("Haftada 2 gün", "Haftada 3 gün"));
        long surveyId = survey.get("id").asLong();
        long option1 = survey.get("options").get(0).get("id").asLong();
        long option2 = survey.get("options").get(1).get("id").asLong();

        answer(surveyId, option1, 1L);
        answer(surveyId, option1, 2L);
        answer(surveyId, option1, 3L);
        answer(surveyId, option2, 4L);

        mockMvc.perform(get("/api/surveys/{id}/results", surveyId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.surveyId").value(surveyId))
                .andExpect(jsonPath("$.totalResponses").value(4))
                .andExpect(jsonPath("$.options.length()").value(2))
                .andExpect(jsonPath("$.options[0].optionId").value(option1))
                .andExpect(jsonPath("$.options[0].voteCount").value(3))
                .andExpect(jsonPath("$.options[0].percentage").value(75.0))
                .andExpect(jsonPath("$.options[1].optionId").value(option2))
                .andExpect(jsonPath("$.options[1].voteCount").value(1))
                .andExpect(jsonPath("$.options[1].percentage").value(25.0));
    }

    @Test
    void hicYanitYokkenTumSeceneklerYuzdeSifirDoner() throws Exception {
        JsonNode survey = createSurvey("Henüz yanıtsız anket?", List.of("A", "B"));
        long surveyId = survey.get("id").asLong();

        mockMvc.perform(get("/api/surveys/{id}/results", surveyId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalResponses").value(0))
                .andExpect(jsonPath("$.options[0].percentage").value(0.0))
                .andExpect(jsonPath("$.options[1].percentage").value(0.0));
    }

    @Test
    void olmayanAnketinSonucuIstenirse404Doner() throws Exception {
        mockMvc.perform(get("/api/surveys/{id}/results", 999999L))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.detail").value("Anket bulunamadı."));
    }
}
