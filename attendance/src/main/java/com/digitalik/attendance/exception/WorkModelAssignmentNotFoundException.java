package com.digitalik.attendance.exception;

public class WorkModelAssignmentNotFoundException extends RuntimeException {

    public WorkModelAssignmentNotFoundException() {
        super("Bu çalışan için bir çalışma modeli ataması bulunamadı.");
    }
}
