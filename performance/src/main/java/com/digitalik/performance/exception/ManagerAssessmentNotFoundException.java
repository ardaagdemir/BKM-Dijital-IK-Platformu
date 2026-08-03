package com.digitalik.performance.exception;

public class ManagerAssessmentNotFoundException extends RuntimeException {

    public ManagerAssessmentNotFoundException() {
        super("Yönetici değerlendirmesi bulunamadı.");
    }
}
