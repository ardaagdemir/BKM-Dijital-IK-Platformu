package com.digitalik.organization.exception;

public class EmployeeNotFoundException extends RuntimeException {

    public EmployeeNotFoundException() {
        super("Çalışan bulunamadı.");
    }
}
