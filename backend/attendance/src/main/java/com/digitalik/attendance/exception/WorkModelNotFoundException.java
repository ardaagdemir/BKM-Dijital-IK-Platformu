package com.digitalik.attendance.exception;

public class WorkModelNotFoundException extends RuntimeException {

    public WorkModelNotFoundException() {
        super("Çalışma modeli bulunamadı.");
    }
}
