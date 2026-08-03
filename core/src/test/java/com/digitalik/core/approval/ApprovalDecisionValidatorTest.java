package com.digitalik.core.approval;

import static org.assertj.core.api.Assertions.assertThatIllegalArgumentException;
import static org.assertj.core.api.Assertions.assertThatNoException;

import org.junit.jupiter.api.Test;

/**
 * Bölüm 9.2 kısmi sadeleştirmesi: {@code leave.LeaveRequestService.decide}/
 * {@code training.TrainingEnrollmentService.decide}/{@code
 * travel.ExpenseItemService.decide}/{@code
 * club.ClubMembershipRequestService.decide}'da birebir tekrarlanan
 * doğrulama mantığının artık bu tek yerden test edilmesi — dört modülün
 * kendi testleri hâlâ kendi `decide` uçlarını uçtan uca doğruluyor, bu
 * test yalnızca ORTAK doğrulama kuralının kendisini (Spring context'i
 * olmadan, saf JUnit) kapsıyor. Spring bağlamı gerekmiyor çünkü {@link
 * ApprovalDecisionValidator} durumsuz (stateless) bir yardımcı sınıf.
 */
class ApprovalDecisionValidatorTest {

    private enum TestStatus implements ApprovalStatus {
        PENDING,
        APPROVED,
        REJECTED,
        COMPLETED;

        @Override
        public boolean isPending() {
            return this == PENDING;
        }

        @Override
        public boolean isApproved() {
            return this == APPROVED;
        }

        @Override
        public boolean isRejected() {
            return this == REJECTED;
        }
    }

    @Test
    void beklemedekiKayitOnaylanabilir() {
        assertThatNoException()
                .isThrownBy(() -> ApprovalDecisionValidator.validate(
                        TestStatus.PENDING, TestStatus.APPROVED, null, "Zaten karara bağlanmış."));
    }

    @Test
    void beklemedekiKayitGerekceyleReddedilebilir() {
        assertThatNoException()
                .isThrownBy(() -> ApprovalDecisionValidator.validate(
                        TestStatus.PENDING, TestStatus.REJECTED, "Kontenjan dolu.", "Zaten karara bağlanmış."));
    }

    @Test
    void kararYalnizcaOnayVeyaRetOlabilir() {
        assertThatIllegalArgumentException()
                .isThrownBy(() -> ApprovalDecisionValidator.validate(
                        TestStatus.PENDING, TestStatus.PENDING, null, "Zaten karara bağlanmış."))
                .withMessage("Karar yalnızca APPROVED veya REJECTED olabilir.");

        assertThatIllegalArgumentException()
                .isThrownBy(() -> ApprovalDecisionValidator.validate(
                        TestStatus.PENDING, TestStatus.COMPLETED, null, "Zaten karara bağlanmış."))
                .withMessage("Karar yalnızca APPROVED veya REJECTED olabilir.");
    }

    @Test
    void beklemedeOlmayanKayitTekrarKararaBaglanamaz() {
        assertThatIllegalArgumentException()
                .isThrownBy(() -> ApprovalDecisionValidator.validate(
                        TestStatus.APPROVED, TestStatus.REJECTED, "Gerekçe", "Bu talep zaten karara bağlanmış."))
                .withMessage("Bu talep zaten karara bağlanmış.");
    }

    @Test
    void gerekcesizRetReddedilir() {
        assertThatIllegalArgumentException()
                .isThrownBy(() -> ApprovalDecisionValidator.validate(
                        TestStatus.PENDING, TestStatus.REJECTED, "   ", "Zaten karara bağlanmış."))
                .withMessage("Ret gerekçesi zorunludur.");

        assertThatIllegalArgumentException()
                .isThrownBy(() -> ApprovalDecisionValidator.validate(
                        TestStatus.PENDING, TestStatus.REJECTED, null, "Zaten karara bağlanmış."))
                .withMessage("Ret gerekçesi zorunludur.");
    }
}
