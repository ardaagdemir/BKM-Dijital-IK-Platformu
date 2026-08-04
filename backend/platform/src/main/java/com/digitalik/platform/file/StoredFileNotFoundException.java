package com.digitalik.platform.file;

public class StoredFileNotFoundException extends RuntimeException {

    public StoredFileNotFoundException() {
        super("Dosya bulunamadı.");
    }
}
