package com.digitalik.training.exception;

public class TrainingNotFoundException extends RuntimeException {

    public TrainingNotFoundException() {
        super("Eğitim bulunamadı.");
    }
}
