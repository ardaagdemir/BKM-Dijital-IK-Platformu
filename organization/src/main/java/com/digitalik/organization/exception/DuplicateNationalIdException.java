package com.digitalik.organization.exception;

public class DuplicateNationalIdException extends RuntimeException {

    public DuplicateNationalIdException() {
        super("Bu TC Kimlik No ile kayıtlı bir çalışan zaten var.");
    }
}
