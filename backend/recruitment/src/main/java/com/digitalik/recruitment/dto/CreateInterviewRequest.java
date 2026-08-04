package com.digitalik.recruitment.dto;

import java.time.LocalDate;

public record CreateInterviewRequest(LocalDate interviewDate, String participants, String result) {
}
