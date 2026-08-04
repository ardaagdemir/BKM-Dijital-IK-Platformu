package com.digitalik.travel.exception;

public class TravelRequestNotFoundException extends RuntimeException {

    public TravelRequestNotFoundException() {
        super("Seyahat talebi bulunamadı.");
    }
}
