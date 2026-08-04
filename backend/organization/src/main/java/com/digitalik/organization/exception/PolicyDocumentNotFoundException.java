package com.digitalik.organization.exception;

public class PolicyDocumentNotFoundException extends RuntimeException {

    public PolicyDocumentNotFoundException() {
        super("Doküman bulunamadı.");
    }
}
