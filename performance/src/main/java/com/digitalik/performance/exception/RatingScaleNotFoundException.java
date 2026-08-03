package com.digitalik.performance.exception;

public class RatingScaleNotFoundException extends RuntimeException {

    public RatingScaleNotFoundException() {
        super("Puanlama skalası henüz tanımlanmamış.");
    }
}
