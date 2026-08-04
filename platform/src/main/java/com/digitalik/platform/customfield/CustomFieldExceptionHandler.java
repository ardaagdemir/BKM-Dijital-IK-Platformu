package com.digitalik.platform.customfield;

import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.security.authorization.AuthorizationDeniedException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * US-09.5.1: {@code platform.approval.ApprovalExceptionHandler}'ın {@code
 * basePackageClasses} kapsamı yalnızca {@code approval} paketini
 * kapsadığından, kardeş paket {@code customfield} kendi advice'ına ihtiyaç
 * duyuyor — aksi halde {@code CustomFieldDefinitionController}'daki {@code
 * @PreAuthorize} reddi ({@link AuthorizationDeniedException}), platform
 * geneli {@code GlobalExceptionHandler}'ın genel {@code Exception.class}
 * yakalayıcısına düşüp yanlışlıkla 500 döner (bkz. {@code
 * ApprovalExceptionHandler}'daki AYNI ders).
 */
@RestControllerAdvice(basePackageClasses = CustomFieldDefinitionController.class)
@Order(Ordered.HIGHEST_PRECEDENCE)
class CustomFieldExceptionHandler {

    @ExceptionHandler(AuthorizationDeniedException.class)
    ProblemDetail handleAuthorizationDenied(AuthorizationDeniedException ex) {
        ProblemDetail problem =
                ProblemDetail.forStatusAndDetail(HttpStatus.FORBIDDEN, "Bu işlemi yapmaya yetkiniz yok.");
        problem.setTitle("Erişim reddedildi");
        return problem;
    }
}
