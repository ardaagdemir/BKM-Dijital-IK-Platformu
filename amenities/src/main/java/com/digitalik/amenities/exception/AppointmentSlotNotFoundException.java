package com.digitalik.amenities.exception;

public class AppointmentSlotNotFoundException extends RuntimeException {

    public AppointmentSlotNotFoundException() {
        super("Slot bulunamadı.");
    }
}
