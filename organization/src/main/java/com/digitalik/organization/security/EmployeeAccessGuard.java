package com.digitalik.organization.security;

import com.digitalik.organization.entity.Employee;
import com.digitalik.organization.repository.EmployeeRepository;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

/**
 * US-03.2.6: "Çalışan yalnızca kendi kaydını görür" kabul kriterinin kayıt
 * bazlı kontrolü — alan/kayıt bazlı yetkinin projedeki ilk somut örneği.
 *
 * <p>{@code organization} modülü {@code auth}'a bağımlı olmadığından
 * (yalnızca core'a bağımlı kuralı), giriş yapmış kullanıcının kimliğine
 * {@code auth.security.AuthenticatedUser} türü üzerinden erişilemez — yalnızca
 * jenerik Spring Security {@code Authentication.getName()} kullanılabilir. Bu,
 * {@code AuthenticatedUser}'ın {@code AuthenticatedPrincipal} uygulamasıyla
 * (bkz. o sınıf) kullanıcının e-postasını döner. Eşleştirme bu yüzden
 * {@code Employee.email} ile yapılıyor — TC No/userId gibi daha güçlü bir
 * bağ (ör. {@code Employee.userId}) için henüz bir kullanıcı-oluşturma akışı
 * projede yok (yalnızca tek bir bootstrap admin var); ikinci bir somut ihtiyaç
 * (ör. e-posta değişebilirliği bir sorun yaratırsa) çıkınca güçlendirilir
 * (YAGNI).
 */
@Component
public class EmployeeAccessGuard {

    private final EmployeeRepository employeeRepository;

    public EmployeeAccessGuard(EmployeeRepository employeeRepository) {
        this.employeeRepository = employeeRepository;
    }

    public boolean isSelf(Long employeeId, Authentication authentication) {
        if (authentication == null || employeeId == null) {
            return false;
        }

        return employeeRepository
                .findById(employeeId)
                .map(Employee::getEmail)
                .map(email -> email.equalsIgnoreCase(authentication.getName()))
                .orElse(false);
    }
}
