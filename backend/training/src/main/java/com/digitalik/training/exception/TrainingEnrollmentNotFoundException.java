package com.digitalik.training.exception;

public class TrainingEnrollmentNotFoundException extends RuntimeException {

    public TrainingEnrollmentNotFoundException() {
        super("Eğitim talebi bulunamadı.");
    }
}
