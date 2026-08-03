package com.digitalik.leave.service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import org.springframework.stereotype.Service;

/**
 * US-04.1.2: Hizmet yılına bağlı yıllık izin hak edişi hesaplaması — basit
 * bir kademe tablosuyla (İş Kanunu m.53'teki gerçek, istatüsel kademelerle
 * aynı: bu, "hedefsiz" uydurma bir tablo değil, kabul kriterinin istediği
 * "basit kademe tablosu"nun somut, gerçek bir örneği).
 *
 * <p><b>Kasıtlı olarak yapılmayanlar (YAGNI):</b> 18 yaş altı/50 yaş üstü
 * çalışanlar için asgari 20 gün istisnası (İş Kanunu m.53) uygulanmadı — bunun
 * için doğum tarihi gerekir ({@code organization.EmployeeProfile.birthDate}),
 * ve bu alan İSTEĞE BAĞLIDIR (US-03.3.1), her çalışan için var olacağı garanti
 * edilemez; ayrıca bu story'nin Requirement ID'si (FR-101) yalnızca hizmet
 * yılını konu ediyor, yaş/cinsiyet/grup kısıtları FR-104'e (henüz roadmap'te
 * bir story'si yok) ait. Kademe tablosu, ihtiyaç netleşene kadar (ör. İK'nın
 * bunu ekrandan değiştirebilmesi istenene kadar) veritabanı tablosu değil,
 * SABİT kod — {@code leave.LeaveType}'ın aksine (o bir referans LİSTESİdir,
 * İK tarafından yönetilir), bu saf bir hesaplama kuralıdır.
 *
 * <p><b>Modül bağımsızlığı:</b> {@code leave}, {@code organization}'a bağımlı
 * DEĞİLDİR (yalnızca core'a bağımlı kuralı) — bu yüzden {@code hireDate}
 * burada {@code Employee}'den OKUNMUYOR, çağıran taraf (ör. ileride bir
 * orkestrasyon katmanı veya frontend) parametre olarak veriyor. Story'nin
 * kabul kriteri zaten yalnızca "hesaplama"dan bahsediyor, bir çalışan
 * kaydına bağlı KALICI bir hak ediş alanından değil (bu, US-04.1.3'ün
 * "bakiye" kavramıyla ayrı ele alınacak).
 */
@Service
public class LeaveEntitlementService {

    public LeaveEntitlement calculate(LocalDate hireDate, LocalDate asOfDate) {
        if (hireDate == null) {
            throw new IllegalArgumentException("İşe giriş tarihi boş olamaz.");
        }
        if (asOfDate == null) {
            throw new IllegalArgumentException("Hesaplama tarihi boş olamaz.");
        }
        if (hireDate.isAfter(asOfDate)) {
            throw new IllegalArgumentException("İşe giriş tarihi hesaplama tarihinden sonra olamaz.");
        }

        long yearsOfService = ChronoUnit.YEARS.between(hireDate, asOfDate);
        return new LeaveEntitlement(yearsOfService, entitlementForYearsOfService(yearsOfService));
    }

    /**
     * İş Kanunu m.53 kademeleri: 1 yıldan az → 0 (henüz hak yok), 1-5 yıl
     * (5 dahil) → 14, 5-15 yıl (5 hariç, 15 hariç) → 20, 15 yıl ve üzeri → 26.
     */
    private int entitlementForYearsOfService(long yearsOfService) {
        if (yearsOfService < 1) {
            return 0;
        }
        if (yearsOfService <= 5) {
            return 14;
        }
        if (yearsOfService < 15) {
            return 20;
        }
        return 26;
    }

    public record LeaveEntitlement(long yearsOfService, int entitlementDays) {
    }
}
