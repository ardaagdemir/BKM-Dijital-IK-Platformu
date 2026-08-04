package com.digitalik.amenities.exception;

public class AppointmentNotFoundException extends RuntimeException {

    public AppointmentNotFoundException() {
        super("Randevu bulunamadı.");
    }
}
