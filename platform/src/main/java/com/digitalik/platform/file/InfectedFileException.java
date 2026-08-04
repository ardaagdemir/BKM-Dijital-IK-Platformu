package com.digitalik.platform.file;

public class InfectedFileException extends RuntimeException {

    public InfectedFileException() {
        super("Dosyada virüs/kötü amaçlı içerik tespit edildi.");
    }
}
