package com.digitalik.performance.exception;

public class GoalNotFoundException extends RuntimeException {

    public GoalNotFoundException() {
        super("Hedef bulunamadı.");
    }
}
