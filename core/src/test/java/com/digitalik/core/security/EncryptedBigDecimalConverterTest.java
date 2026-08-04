package com.digitalik.core.security;

import static org.assertj.core.api.Assertions.assertThat;

import java.math.BigDecimal;
import org.junit.jupiter.api.Test;

/** US-09.9.1: {@link EncryptedBigDecimalConverter}'ın gidiş-dönüş doğruluğu ve deterministik davranışı. */
class EncryptedBigDecimalConverterTest {

    private static final String TEST_KEY = "AAECAwQFBgcICQoLDA0ODxAREhMUFRYXGBkaGxwdHh8=";

    private final EncryptedBigDecimalConverter converter =
            new EncryptedBigDecimalConverter(new EncryptedStringConverter(TEST_KEY));

    @Test
    void sifrelenenTutarGeriCozulunceAyniDegeriVerir() {
        BigDecimal amount = new BigDecimal("15000.50");

        String encrypted = converter.convertToDatabaseColumn(amount);

        assertThat(encrypted).doesNotContain("15000.50");
        assertThat(converter.convertToEntityAttribute(encrypted)).isEqualByComparingTo(amount);
    }

    @Test
    void ayniTutarHerZamanAyniSifreliMetniUretir() {
        BigDecimal amount = new BigDecimal("15000.50");

        assertThat(converter.convertToDatabaseColumn(amount)).isEqualTo(converter.convertToDatabaseColumn(amount));
    }

    @Test
    void nullDegerNullOlarakKalir() {
        assertThat(converter.convertToDatabaseColumn(null)).isNull();
        assertThat(converter.convertToEntityAttribute(null)).isNull();
    }
}
