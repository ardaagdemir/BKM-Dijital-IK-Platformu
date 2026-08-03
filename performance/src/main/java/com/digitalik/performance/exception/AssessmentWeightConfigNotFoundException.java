package com.digitalik.performance.exception;

public class AssessmentWeightConfigNotFoundException extends RuntimeException {

    public AssessmentWeightConfigNotFoundException() {
        super("Nihai not ağırlıklandırması henüz tanımlanmamış.");
    }
}
