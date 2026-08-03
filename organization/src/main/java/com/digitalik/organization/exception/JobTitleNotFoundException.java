package com.digitalik.organization.exception;

public class JobTitleNotFoundException extends RuntimeException {

    public JobTitleNotFoundException() {
        super("Unvan bulunamadı.");
    }
}
