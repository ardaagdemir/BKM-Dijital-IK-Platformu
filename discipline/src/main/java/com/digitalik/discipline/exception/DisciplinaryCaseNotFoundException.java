package com.digitalik.discipline.exception;

public class DisciplinaryCaseNotFoundException extends RuntimeException {

    public DisciplinaryCaseNotFoundException() {
        super("Ceza süreci bulunamadı.");
    }
}
