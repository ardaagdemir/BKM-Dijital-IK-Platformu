package com.digitalik.organization.exception;

public class OrganizationUnitNotFoundException extends RuntimeException {

    public OrganizationUnitNotFoundException() {
        super("Birim bulunamadı.");
    }
}
