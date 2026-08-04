package com.digitalik.leave.service;

import com.digitalik.core.approval.ApprovalDecisionValidator;
import com.digitalik.leave.entity.LeaveRequest;
import com.digitalik.leave.entity.LeaveRequestStatus;
import com.digitalik.leave.exception.LeaveRequestNotFoundException;
import com.digitalik.leave.exception.LeaveTypeNotFoundException;
import com.digitalik.leave.repository.LeaveRequestRepository;
import com.digitalik.leave.repository.LeaveTypeRepository;
import java.time.LocalDate;
import java.util.List;
import org.springframework.stereotype.Service;

/**
 * US-04.2.1: İzin talebi oluşturma (tür, tarih aralığı) — {@code PENDING}
 * durumuyla kaydedilir.
 *
 * <p>Kabul kriteri: "yetersiz bakiyede uyarı gösterir (ENGELLEMEYEBİLİR)" —
 * bu yüzden yetersiz bakiye asla talebi REDDETMİYOR, yalnızca sonuçta bir
 * uyarı metni dönüyor. Bu kontrol {@code hireDate} İSTEĞE BAĞLI bir parametre
 * olduğunda çalışıyor: {@code leave} modülü {@code organization}'a bağımlı
 * olmadığından çalışanın işe giriş tarihini kendisi okuyamıyor (bkz.
 * US-04.1.2/US-04.1.3'teki aynı kısıt) — çağıran taraf isterse sağlar, o
 * zaman bakiye kontrolü yapılır; sağlamazsa talep yine de oluşturulur, sadece
 * uyarı hesaplanmaz. Bu, "talebi engellemeyebilir" kabul kriteriyle de
 * tutarlı bir esneklik.
 */
@Service
public class LeaveRequestService {

    private final LeaveRequestRepository leaveRequestRepository;
    private final LeaveTypeRepository leaveTypeRepository;
    private final LeaveBalanceService leaveBalanceService;
    private final LeaveNotificationService leaveNotificationService;

    public LeaveRequestService(
            LeaveRequestRepository leaveRequestRepository,
            LeaveTypeRepository leaveTypeRepository,
            LeaveBalanceService leaveBalanceService,
            LeaveNotificationService leaveNotificationService) {
        this.leaveRequestRepository = leaveRequestRepository;
        this.leaveTypeRepository = leaveTypeRepository;
        this.leaveBalanceService = leaveBalanceService;
        this.leaveNotificationService = leaveNotificationService;
    }

    public CreatedLeaveRequest create(
            Long employeeId,
            Long leaveTypeId,
            LocalDate startDate,
            LocalDate endDate,
            LocalDate hireDate,
            String employeeEmail) {
        if (employeeId == null) {
            throw new IllegalArgumentException("Çalışan boş olamaz.");
        }
        if (leaveTypeId == null) {
            throw new IllegalArgumentException("İzin türü boş olamaz.");
        }
        if (startDate == null || endDate == null) {
            throw new IllegalArgumentException("Tarih aralığı boş olamaz.");
        }
        if (endDate.isBefore(startDate)) {
            throw new IllegalArgumentException("Bitiş tarihi başlangıç tarihinden önce olamaz.");
        }
        if (!leaveTypeRepository.existsById(leaveTypeId)) {
            throw new LeaveTypeNotFoundException();
        }

        LeaveRequest newLeaveRequest = new LeaveRequest(employeeId, leaveTypeId, startDate, endDate, employeeEmail);
        long requestedDays = newLeaveRequest.getRequestedDays();

        // Uyarı, bu talep KAYDEDİLMEDEN ÖNCE (yalnızca mevcut PENDING/APPROVED
        // taleplerle) hesaplanır — aksi halde US-04.2.3'ten sonra bu talebin
        // kendisi de "onay bekleyen" toplamına dahil olur ve kalan bakiyeyi
        // yanlışlıkla kendi büyüklüğü kadar azaltıp her zaman uyarı tetikler.
        String balanceWarning =
                hireDate != null ? buildBalanceWarning(employeeId, hireDate, requestedDays) : null;

        LeaveRequest leaveRequest = leaveRequestRepository.save(newLeaveRequest);

        return new CreatedLeaveRequest(leaveRequest, requestedDays, balanceWarning);
    }

    private String buildBalanceWarning(Long employeeId, LocalDate hireDate, long requestedDays) {
        var balance = leaveBalanceService.calculateBalance(employeeId, hireDate, LocalDate.now());
        if (requestedDays > balance.remainingDays()) {
            return "Bakiye yetersiz: kalan %d gün, talep edilen %d gün.".formatted(balance.remainingDays(), requestedDays);
        }
        return null;
    }

    /**
     * US-04.2.2: Onay/ret — yalnızca {@code PENDING} bir talep karara
     * bağlanabilir; {@code REJECTED} için gerekçe zorunludur. Talebin
     * gerçekten kararı verenin "ekibinde" olup olmadığı YETKİLENDİRME
     * seviyesinde ({@code @PreAuthorize} + {@code LeaveRequestAccessGuard})
     * kontrol edilir, burada DEĞİL — bu metod yalnızca durum geçişinin
     * kendisinin geçerliliğinden sorumlu.
     *
     * <p>US-04.3.1: Karar kaydedildikten SONRA {@link LeaveNotificationService}
     * çağrılır — bildirim, kararın kendisinin bir ön koşulu değil, bir yan
     * etkisi; e-posta gönderimi başarısız olsa bile (bkz. o sınıftaki not)
     * karar zaten veritabanına işlenmiş olur.
     */
    public LeaveRequest decide(Long id, LeaveRequestStatus decision, String rejectionReason) {
        LeaveRequest leaveRequest = leaveRequestRepository.findById(id).orElseThrow(LeaveRequestNotFoundException::new);

        ApprovalDecisionValidator.validate(
                leaveRequest.getStatus(), decision, rejectionReason, "Bu talep zaten karara bağlanmış.");

        if (decision == LeaveRequestStatus.REJECTED) {
            leaveRequest.reject(rejectionReason);
        } else {
            leaveRequest.approve();
        }

        LeaveRequest decided = leaveRequestRepository.save(leaveRequest);
        leaveNotificationService.sendDecisionNotification(decided);
        return decided;
    }

    /**
     * US-04.2.4: Çalışanın geçmiş/mevcut talepleri (en yeni önce). Rol
     * kısıtlaması BİLİNÇLİ OLARAK eklenmedi — bu story'nin (US-03.2.6'nın
     * aksine) kabul kriteri "yalnızca kendi listesini görür" DEMİYOR, yalnızca
     * "geçmiş/mevcut ... görüntülemek" diyor; ayrıca {@code leave}'in
     * {@code organization}'a bağımlı olmaması nedeniyle giriş yapan
     * kullanıcının hangi {@code employeeId}'ye karşılık geldiğini zaten
     * doğrulayamıyor (bkz. US-04.2.2'deki aynı kısıt).
     */
    public List<LeaveRequest> listByEmployee(Long employeeId) {
        if (employeeId == null) {
            throw new IllegalArgumentException("Çalışan boş olamaz.");
        }

        return leaveRequestRepository.findByEmployeeIdOrderByStartDateDescIdDesc(employeeId);
    }

    public record CreatedLeaveRequest(LeaveRequest leaveRequest, long requestedDays, String balanceWarning) {
    }
}
