package com.digitalik.feedback.exception;

public class SurveyOptionNotFoundException extends RuntimeException {

    public SurveyOptionNotFoundException() {
        super("Seçenek bulunamadı.");
    }
}
