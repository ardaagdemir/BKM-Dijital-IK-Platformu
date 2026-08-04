package com.digitalik.organization.exception;

public class EmployeeProfileNotFoundException extends RuntimeException {

    public EmployeeProfileNotFoundException() {
        super("Özlük bilgisi bulunamadı.");
    }
}
