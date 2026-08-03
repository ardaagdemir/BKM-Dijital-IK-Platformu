package com.digitalik.organization.exception;

public class EmployeeAssetNotFoundException extends RuntimeException {

    public EmployeeAssetNotFoundException() {
        super("Zimmet kaydı bulunamadı.");
    }
}
