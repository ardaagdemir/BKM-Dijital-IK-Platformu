package com.digitalik.amenities.exception;

public class ClubNotFoundException extends RuntimeException {

    public ClubNotFoundException() {
        super("Kulüp bulunamadı.");
    }
}
