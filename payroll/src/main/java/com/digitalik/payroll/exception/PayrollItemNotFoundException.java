package com.digitalik.payroll.exception;

public class PayrollItemNotFoundException extends RuntimeException {

    public PayrollItemNotFoundException() {
        super("Ücret kalemi bulunamadı.");
    }
}
