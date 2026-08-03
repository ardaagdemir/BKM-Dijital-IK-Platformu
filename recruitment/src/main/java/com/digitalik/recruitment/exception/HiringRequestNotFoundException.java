package com.digitalik.recruitment.exception;

public class HiringRequestNotFoundException extends RuntimeException {

    public HiringRequestNotFoundException() {
        super("İşe alım talebi bulunamadı.");
    }
}
