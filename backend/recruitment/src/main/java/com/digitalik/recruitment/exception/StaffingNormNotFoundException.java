package com.digitalik.recruitment.exception;

public class StaffingNormNotFoundException extends RuntimeException {

    public StaffingNormNotFoundException() {
        super("Bu birim/unvan için norm kadro tanımlı değil.");
    }
}
