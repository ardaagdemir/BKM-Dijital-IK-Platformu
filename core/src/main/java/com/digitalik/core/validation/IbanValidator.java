package com.digitalik.core.validation;

import java.math.BigInteger;

/**
 * US-09.8.1: IBAN format doğrulaması — ISO 13616 mod-97 kontrol basamağı
 * algoritması. Saf algoritma, harici çağrı YOK (banka/SWIFT servisine
 * bağlanmıyor) — iş mantığı içermeyen genel amaçlı bir yardımcı olduğundan
 * {@code core.approval.ApprovalStatus}'la AYNI gerekçeyle burada.
 */
public final class IbanValidator {

    private static final BigInteger NINETY_SEVEN = BigInteger.valueOf(97);

    private IbanValidator() {
    }

    public static boolean isValid(String iban) {
        if (iban == null) {
            return false;
        }
        String normalized = iban.replaceAll("\\s", "").toUpperCase();
        if (normalized.length() < 15 || normalized.length() > 34) {
            return false;
        }
        if (!normalized.matches("[A-Z]{2}[0-9]{2}[A-Z0-9]+")) {
            return false;
        }

        String rearranged = normalized.substring(4) + normalized.substring(0, 4);
        StringBuilder numeric = new StringBuilder();
        for (char c : rearranged.toCharArray()) {
            numeric.append(Character.getNumericValue(c));
        }

        return new BigInteger(numeric.toString()).mod(NINETY_SEVEN).equals(BigInteger.ONE);
    }
}
