package com.digitalik.leave.exception;

public class DuplicateLeaveTypeCodeException extends RuntimeException {

    public DuplicateLeaveTypeCodeException() {
        super("Bu kod ile kayıtlı bir izin türü zaten var.");
    }
}
