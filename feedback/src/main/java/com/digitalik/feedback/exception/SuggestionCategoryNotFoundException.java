package com.digitalik.feedback.exception;

public class SuggestionCategoryNotFoundException extends RuntimeException {

    public SuggestionCategoryNotFoundException() {
        super("Kategori bulunamadı.");
    }
}
