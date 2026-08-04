package com.digitalik.core.security;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.util.Arrays;
import java.util.Base64;
import javax.crypto.Cipher;
import javax.crypto.Mac;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * US-09.9.1: Hassas sütunlar (TC No, IBAN, ücret) için AES-GCM ile
 * DETERMİNİSTİK şifreleme — AYNI açık metin HER ZAMAN AYNI şifreli metni
 * üretir (rastgele bir IV yerine, açık metin + anahtardan HMAC-SHA256 ile
 * türetilen bir IV kullanılarak). Bu BİLİNÇLİ bir tasarım kararı: {@code
 * organization.Employee.nationalId} üzerinde hem bir DB seviyesi {@code
 * UNIQUE} kısıtı HEM de {@code existsByNationalId} eşitlik sorgusu var —
 * standart rastgele-IV AES-GCM'de aynı açık metin her seferinde FARKLI
 * bir şifreli metin üretir, bu da hem UNIQUE kısıtını hem de eşitlik
 * sorgusunu anlamsız hale getirirdi.
 *
 * <p><b>Bilinen ödünleşim:</b> deterministik şifreleme, aynı açık metne
 * sahip iki satırın şifreli halinin de aynı olacağını ima eder ("bu iki
 * kayıt aynı değere sahip" bilgisi sızabilir) — rastgele-IV şemanın
 * vermediği bir bilgi. Bu, eşitlik sorgusu/UNIQUE kısıtı ihtiyacı olan bir
 * alan için endüstride kabul edilen, bilinçli bir ödünleşimdir
 * ("deterministic AEAD" deseni).
 *
 * <p>Anahtar {@code app.security.encryption-key}'den (Base64, 256-bit)
 * geliyor — {@code app.mail.from-address}'teki AYNI dışsallaştırılmış
 * config deseni. {@code @Component} olarak işaretli — Spring Boot'un
 * Hibernate entegrasyonu, {@code @Converter} sınıflarını Spring bean
 * container'ından (constructor injection dahil) çözer.
 */
@Converter
@Component
public class EncryptedStringConverter implements AttributeConverter<String, String> {

    private static final int GCM_IV_LENGTH = 12;
    private static final int GCM_TAG_LENGTH_BITS = 128;

    private final SecretKeySpec aesKey;
    private final SecretKeySpec hmacKey;

    public EncryptedStringConverter(@Value("${app.security.encryption-key}") String base64Key) {
        byte[] rawKey = Base64.getDecoder().decode(base64Key);
        this.aesKey = new SecretKeySpec(rawKey, "AES");
        this.hmacKey = new SecretKeySpec(rawKey, "HmacSHA256");
    }

    @Override
    public String convertToDatabaseColumn(String attribute) {
        return attribute == null ? null : encrypt(attribute);
    }

    @Override
    public String convertToEntityAttribute(String dbData) {
        return dbData == null ? null : decrypt(dbData);
    }

    private String encrypt(String plaintext) {
        try {
            byte[] iv = deriveIv(plaintext);
            Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
            cipher.init(Cipher.ENCRYPT_MODE, aesKey, new GCMParameterSpec(GCM_TAG_LENGTH_BITS, iv));
            byte[] ciphertext = cipher.doFinal(plaintext.getBytes(StandardCharsets.UTF_8));

            byte[] combined = new byte[iv.length + ciphertext.length];
            System.arraycopy(iv, 0, combined, 0, iv.length);
            System.arraycopy(ciphertext, 0, combined, iv.length, ciphertext.length);
            return Base64.getEncoder().encodeToString(combined);
        } catch (GeneralSecurityException ex) {
            throw new IllegalStateException("Şifreleme başarısız.", ex);
        }
    }

    private String decrypt(String encoded) {
        try {
            byte[] combined = Base64.getDecoder().decode(encoded);
            byte[] iv = Arrays.copyOfRange(combined, 0, GCM_IV_LENGTH);
            byte[] ciphertext = Arrays.copyOfRange(combined, GCM_IV_LENGTH, combined.length);

            Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
            cipher.init(Cipher.DECRYPT_MODE, aesKey, new GCMParameterSpec(GCM_TAG_LENGTH_BITS, iv));
            return new String(cipher.doFinal(ciphertext), StandardCharsets.UTF_8);
        } catch (GeneralSecurityException ex) {
            throw new IllegalStateException("Şifre çözme başarısız.", ex);
        }
    }

    private byte[] deriveIv(String plaintext) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(hmacKey);
            byte[] digest = mac.doFinal(plaintext.getBytes(StandardCharsets.UTF_8));
            return Arrays.copyOf(digest, GCM_IV_LENGTH);
        } catch (GeneralSecurityException ex) {
            throw new IllegalStateException("IV türetme başarısız.", ex);
        }
    }
}
