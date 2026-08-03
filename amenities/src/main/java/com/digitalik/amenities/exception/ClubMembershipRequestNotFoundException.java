package com.digitalik.amenities.exception;

public class ClubMembershipRequestNotFoundException extends RuntimeException {

    public ClubMembershipRequestNotFoundException() {
        super("Üyelik talebi bulunamadı.");
    }
}
