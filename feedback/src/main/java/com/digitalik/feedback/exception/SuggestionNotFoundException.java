package com.digitalik.feedback.exception;

public class SuggestionNotFoundException extends RuntimeException {

    public SuggestionNotFoundException() {
        super("Talep bulunamadı.");
    }
}
