package com.digitalik.auth.exception;

public class UserNotFoundException extends RuntimeException {

    public UserNotFoundException() {
        super("Kullanıcı bulunamadı.");
    }
}
