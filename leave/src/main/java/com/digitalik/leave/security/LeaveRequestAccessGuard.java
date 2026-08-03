package com.digitalik.leave.security;

import com.digitalik.leave.repository.LeaveRequestRepository;
import java.util.List;
import org.springframework.stereotype.Component;

/**
 * US-04.2.2: "Yönetici yalnızca kendi ekibinin taleplerini görür/onaylar"
 * kabul kriterinin kayıt bazlı kontrolü.
 *
 * <p><b>Bilinçli bir güven sınırı:</b> {@code leave} modülü {@code organization}'a
 * bağımlı olmadığından (yalnızca core'a bağımlı mimari kuralı), "bu çalışan
 * gerçekten bu yöneticinin ekibinde mi" sorusunu SUNUCU TARAFINDA
 * doğrulayamıyor — {@code organization.OrganizationUnit}/{@code Employee}
 * ilişkisine erişimi yok. Bunun yerine, çağıran taraf (frontend/orkestrasyon
 * katmanı — organization modülünün {@code GET /api/organization/employees?organizationUnitId=...}
 * ucundan bu bilgiyi ZATEN alması gerekiyor) "ekibim" olarak iddia ettiği
 * {@code employeeId} listesini parametre olarak sağlıyor; bu sınıf yalnızca
 * talebin sahibinin bu listede olup olmadığını kontrol ediyor. Gerçek
 * sunucu-taraflı doğrulama, {@code leave}'in organization verisine erişimi
 * OLMADAN mümkün değil — bu, kullanıcıyla birlikte değerlendirilip kabul
 * edilen bir mimari karar (bkz. docs/04-implementation-log.md, US-04.2.2).
 */
@Component
public class LeaveRequestAccessGuard {

    private final LeaveRequestRepository leaveRequestRepository;

    public LeaveRequestAccessGuard(LeaveRequestRepository leaveRequestRepository) {
        this.leaveRequestRepository = leaveRequestRepository;
    }

    public boolean isTeamMember(Long leaveRequestId, List<Long> teamEmployeeIds) {
        if (leaveRequestId == null || teamEmployeeIds == null || teamEmployeeIds.isEmpty()) {
            return false;
        }

        return leaveRequestRepository
                .findById(leaveRequestId)
                .map(request -> teamEmployeeIds.contains(request.getEmployeeId()))
                .orElse(false);
    }
}
