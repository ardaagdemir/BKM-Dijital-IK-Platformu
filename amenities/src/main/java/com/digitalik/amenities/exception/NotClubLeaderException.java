package com.digitalik.amenities.exception;

/** US-08G.1.2: İsteği yapan çalışan, ilgili kulübün lideri (henüz atanmamışsa hiç kimse) değilken etkinlik oluşturmaya çalıştığında. */
public class NotClubLeaderException extends RuntimeException {

    public NotClubLeaderException() {
        super("Yalnızca kulüp lideri etkinlik oluşturabilir.");
    }
}
