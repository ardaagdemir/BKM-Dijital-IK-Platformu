package com.digitalik.core.security;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import java.math.BigDecimal;
import org.springframework.stereotype.Component;

/**
 * US-09.9.1: {@link EncryptedStringConverter}'daki AYNI deterministik
 * AES-GCM şemasının sayısal (ör. ücret) alanlar için varyantı — asıl
 * şifreleme mantığını TEKRARLAMAK yerine {@link EncryptedStringConverter}'a
 * delege eder (metne çevirip şifreler, çözüp geri sayıya çevirir).
 */
@Converter
@Component
public class EncryptedBigDecimalConverter implements AttributeConverter<BigDecimal, String> {

    private final EncryptedStringConverter delegate;

    public EncryptedBigDecimalConverter(EncryptedStringConverter delegate) {
        this.delegate = delegate;
    }

    @Override
    public String convertToDatabaseColumn(BigDecimal attribute) {
        return attribute == null ? null : delegate.convertToDatabaseColumn(attribute.toPlainString());
    }

    @Override
    public BigDecimal convertToEntityAttribute(String dbData) {
        String plain = delegate.convertToEntityAttribute(dbData);
        return plain == null ? null : new BigDecimal(plain);
    }
}
