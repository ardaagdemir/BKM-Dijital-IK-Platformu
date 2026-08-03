package com.digitalik.recruitment.dto;

import java.time.LocalDate;

public record InterviewResponse(Long id, Long candidateId, LocalDate interviewDate, String participants, String result) {
}
