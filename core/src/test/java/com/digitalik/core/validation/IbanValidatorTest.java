package com.digitalik.core.validation;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

/**
 * {@code TR330006100519786457841326}: ISO 13616 mod-97 kontrol basamağını
 * geçen, yaygın olarak test amaçlı kullanılan bir örnek IBAN'dır —
 * gerçek bir hesaba ait değildir.
 */
class IbanValidatorTest {

    private static final String GECERLI_IBAN = "TR330006100519786457841326";

    @Test
    void gecerliIbanKabulEdilir() {
        assertThat(IbanValidator.isValid(GECERLI_IBAN)).isTrue();
    }

    @Test
    void bosluklarVeKucukHarfToleransli() {
        assertThat(IbanValidator.isValid("tr33 0006 1005 1978 6457 8413 26")).isTrue();
    }

    @Test
    void yanlisKontrolBasamagiReddedilir() {
        assertThat(IbanValidator.isValid("TR340006100519786457841326")).isFalse();
    }

    @Test
    void gecersizFormatReddedilir() {
        assertThat(IbanValidator.isValid("12345")).isFalse();
    }

    @Test
    void nullReddedilir() {
        assertThat(IbanValidator.isValid(null)).isFalse();
    }
}
