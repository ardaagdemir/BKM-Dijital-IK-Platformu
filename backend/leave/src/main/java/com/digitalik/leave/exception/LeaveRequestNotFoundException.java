package com.digitalik.leave.exception;

public class LeaveRequestNotFoundException extends RuntimeException {

    public LeaveRequestNotFoundException() {
        super("İzin talebi bulunamadı.");
    }
}
