package com.digitalik.leave.exception;

public class LeaveTypeNotFoundException extends RuntimeException {

    public LeaveTypeNotFoundException() {
        super("İzin türü bulunamadı.");
    }
}
