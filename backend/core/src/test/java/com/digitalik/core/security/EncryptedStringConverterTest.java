package com.digitalik.core.security;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

/**
 * US-09.9.1: {@link EncryptedStringConverter}'ın gidiş-dönüş (round-trip)
 * doğruluğunu VE deterministik olma özelliğini (AYNI açık metnin HER ZAMAN
 * AYNI şifreli metni üretmesi — {@code existsByNationalId} gibi eşitlik
 * sorgularının/DB {@code UNIQUE} kısıtının şifreleme sonrası da çalışmaya
 * devam etmesi için ZORUNLU) doğrular.
 */
class EncryptedStringConverterTest {

    private static final String TEST_KEY = "AAECAwQFBgcICQoLDA0ODxAREhMUFRYXGBkaGxwdHh8=";

    private final EncryptedStringConverter converter = new EncryptedStringConverter(TEST_KEY);

    @Test
    void sifrelenenDegerGeriCozulunceAyniDegeriVerir() {
        String encrypted = converter.convertToDatabaseColumn("10000000146");

        assertThat(encrypted).isNotEqualTo("10000000146");
        assertThat(converter.convertToEntityAttribute(encrypted)).isEqualTo("10000000146");
    }

    @Test
    void ayniAcikMetinHerZamanAyniSifreliMetniUretir() {
        String first = converter.convertToDatabaseColumn("10000000146");
        String second = converter.convertToDatabaseColumn("10000000146");

        assertThat(first).isEqualTo(second);
    }

    @Test
    void farkliAcikMetinlerFarkliSifreliMetinlerUretir() {
        String first = converter.convertToDatabaseColumn("10000000146");
        String second = converter.convertToDatabaseColumn("56212037632");

        assertThat(first).isNotEqualTo(second);
    }

    @Test
    void nullDegerNullOlarakKalir() {
        assertThat(converter.convertToDatabaseColumn(null)).isNull();
        assertThat(converter.convertToEntityAttribute(null)).isNull();
    }
}
