package com.digitalik.platform.approval;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

/**
 * US-09.2.1 kabul kriteri: "Motor, mevcut modüllerin davranışını
 * bozmadan devreye alınır (kademeli geçiş)." Bu izole test bağlamı
 * Flyway'i DEĞİL Hibernate'in şema otomatik üretimini kullandığından
 * (bkz. {@code bootstrap.DijitalIkPlatformuApplicationTests}'teki AYNI
 * gerekçe), V65'in seed ettiği "hiring-request" verisi BURADA YOK — her
 * test kendi 2 adımlı test zincirini {@link ApprovalChainDefinitionService}
 * ile oluşturuyor.
 */
@SpringBootTest
@Transactional
class ApprovalChainServiceTest {

    @Autowired
    private ApprovalChainService approvalChainService;

    @Autowired
    private ApprovalChainDefinitionService approvalChainDefinitionService;

    private String ikiAdimliZincirOlustur(String name) {
        approvalChainDefinitionService.create(name, List.of("YONETICI", "IK"));
        return name;
    }

    @Test
    void ikiAdimliZincirHerIkiAdimdaOnaylaninciTamamenOnaylanir() {
        String chainName = ikiAdimliZincirOlustur("test-zinciri-1");
        ApprovalChainInstance instance = approvalChainService.start(chainName, "HiringRequest", 1L);
        assertThat(instance.getCurrentStepOrder()).isEqualTo(1);
        assertThat(instance.getStatus()).isEqualTo(ApprovalChainInstanceStatus.IN_PROGRESS);

        ApprovalChainInstance afterStep1 = approvalChainService.decide(instance.getId(), 1, true);
        assertThat(afterStep1.getCurrentStepOrder()).isEqualTo(2);
        assertThat(afterStep1.getStatus()).isEqualTo(ApprovalChainInstanceStatus.IN_PROGRESS);

        ApprovalChainInstance afterStep2 = approvalChainService.decide(instance.getId(), 2, true);
        assertThat(afterStep2.getStatus()).isEqualTo(ApprovalChainInstanceStatus.APPROVED);
    }

    @Test
    void ilkAdimdaReddedilirseZincirReddedilir() {
        String chainName = ikiAdimliZincirOlustur("test-zinciri-2");
        ApprovalChainInstance instance = approvalChainService.start(chainName, "HiringRequest", 2L);

        ApprovalChainInstance result = approvalChainService.decide(instance.getId(), 1, false);

        assertThat(result.getStatus()).isEqualTo(ApprovalChainInstanceStatus.REJECTED);
    }

    @Test
    void ikinciAdimdaReddedilirseZincirReddedilir() {
        String chainName = ikiAdimliZincirOlustur("test-zinciri-3");
        ApprovalChainInstance instance = approvalChainService.start(chainName, "HiringRequest", 3L);
        approvalChainService.decide(instance.getId(), 1, true);

        ApprovalChainInstance result = approvalChainService.decide(instance.getId(), 2, false);

        assertThat(result.getStatus()).isEqualTo(ApprovalChainInstanceStatus.REJECTED);
    }

    @Test
    void sonuclanmisZincirTekrarKararaBaglanamaz() {
        String chainName = ikiAdimliZincirOlustur("test-zinciri-4");
        ApprovalChainInstance instance = approvalChainService.start(chainName, "HiringRequest", 4L);
        approvalChainService.decide(instance.getId(), 1, false);

        assertThatThrownBy(() -> approvalChainService.decide(instance.getId(), 1, true))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Bu onay zinciri zaten sonuçlanmış.");
    }

    @Test
    void beklenmeyenAdimSirasiReddedilir() {
        String chainName = ikiAdimliZincirOlustur("test-zinciri-5");
        ApprovalChainInstance instance = approvalChainService.start(chainName, "HiringRequest", 5L);

        assertThatThrownBy(() -> approvalChainService.decide(instance.getId(), 2, true))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Beklenmeyen onay adımı.");
    }

    @Test
    void olmayanZincirAdiylaBaslatilamaz() {
        assertThatThrownBy(() -> approvalChainService.start("olmayan-zincir", "X", 1L))
                .isInstanceOf(ApprovalChainDefinitionNotFoundException.class);
    }

    /** US-09.2.1: {@code recruitment.HiringRequestService.create}'teki iki aşamalı kayıt deseni. */
    @Test
    void subjectIdBaslangictaNullOlabilirVeSonradanAtanabilir() {
        String chainName = ikiAdimliZincirOlustur("test-zinciri-6");
        ApprovalChainInstance instance = approvalChainService.start(chainName, "HiringRequest", null);
        assertThat(instance.getSubjectId()).isNull();

        ApprovalChainInstance updated = approvalChainService.assignSubject(instance.getId(), 42L);

        assertThat(updated.getSubjectId()).isEqualTo(42L);
    }
}
