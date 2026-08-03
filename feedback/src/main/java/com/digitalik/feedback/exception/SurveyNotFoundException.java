package com.digitalik.feedback.exception;

public class SurveyNotFoundException extends RuntimeException {

    public SurveyNotFoundException() {
        super("Anket bulunamadı.");
    }
}
