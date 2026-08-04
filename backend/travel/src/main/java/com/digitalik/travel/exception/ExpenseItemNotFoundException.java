package com.digitalik.travel.exception;

public class ExpenseItemNotFoundException extends RuntimeException {

    public ExpenseItemNotFoundException() {
        super("Masraf kalemi bulunamadı.");
    }
}
