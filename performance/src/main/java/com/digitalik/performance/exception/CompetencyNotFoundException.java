package com.digitalik.performance.exception;

public class CompetencyNotFoundException extends RuntimeException {

    public CompetencyNotFoundException() {
        super("Yetkinlik bulunamadı.");
    }
}
