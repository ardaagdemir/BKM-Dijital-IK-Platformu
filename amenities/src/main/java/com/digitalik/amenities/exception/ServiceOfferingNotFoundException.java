package com.digitalik.amenities.exception;

public class ServiceOfferingNotFoundException extends RuntimeException {

    public ServiceOfferingNotFoundException() {
        super("Hizmet bulunamadı.");
    }
}
