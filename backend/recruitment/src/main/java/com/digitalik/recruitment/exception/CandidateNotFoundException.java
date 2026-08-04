package com.digitalik.recruitment.exception;

public class CandidateNotFoundException extends RuntimeException {

    public CandidateNotFoundException() {
        super("Aday bulunamadı.");
    }
}
