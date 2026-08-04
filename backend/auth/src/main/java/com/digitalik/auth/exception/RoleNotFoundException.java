package com.digitalik.auth.exception;

public class RoleNotFoundException extends RuntimeException {

    public RoleNotFoundException() {
        super("Rol bulunamadı.");
    }
}
