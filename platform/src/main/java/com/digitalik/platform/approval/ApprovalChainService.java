package com.digitalik.platform.approval;

import org.springframework.stereotype.Service;

/**
 * US-09.2.1: Mevcut modüllerdeki (İşe Alım) çok adımlı onay kodunu ortak,
 * parametrik bir motora taşır. Kabul kriteri: "Motor, mevcut modüllerin
 * davranışını bozmadan devreye alınır (kademeli geçiş)."
 *
 * <p>{@code recruitment.HiringRequestService}, kendi ayrıntılı Türkçe hata
 * mesajlarını (ör. "Bu talep zaten yönetici kararına bağlanmış.") KORUMAK
 * için KENDİ ön-doğrulama kontrollerini yapmaya devam ediyor — bu servise
 * yalnızca ön-kontroller geçtikten SONRA, gerçek durum geçişini
 * uygulaması/kaydetmesi için çağrılıyor. Bu nedenle buradaki {@link
 * IllegalArgumentException}'lar normal akışta pratikte hiç tetiklenmez;
 * yalnızca savunma amaçlıdır.
 */
@Service
public class ApprovalChainService {

    private final ApprovalChainDefinitionRepository chainDefinitionRepository;
    private final ApprovalChainStepDefinitionRepository stepDefinitionRepository;
    private final ApprovalChainInstanceRepository chainInstanceRepository;

    public ApprovalChainService(
            ApprovalChainDefinitionRepository chainDefinitionRepository,
            ApprovalChainStepDefinitionRepository stepDefinitionRepository,
            ApprovalChainInstanceRepository chainInstanceRepository) {
        this.chainDefinitionRepository = chainDefinitionRepository;
        this.stepDefinitionRepository = stepDefinitionRepository;
        this.chainInstanceRepository = chainInstanceRepository;
    }

    /**
     * Adı verilen zincir tanımı için yeni bir örnek başlatır (1. adımdan,
     * {@code IN_PROGRESS} durumunda). {@code subjectId} BİLİNÇLİ OLARAK
     * {@code null} OLABİLİR — çağıranın konu nesnesi (ör. {@code
     * HiringRequest}) henüz kendi id'sine sahip değilse, {@link
     * #assignSubject} ile SONRADAN doldurulur (bkz. {@code
     * ApprovalChainInstance}'ın javadoc'u).
     */
    public ApprovalChainInstance start(String chainName, String subjectType, Long subjectId) {
        ApprovalChainDefinition definition =
                chainDefinitionRepository.findByName(chainName).orElseThrow(ApprovalChainDefinitionNotFoundException::new);
        return chainInstanceRepository.save(new ApprovalChainInstance(definition.getId(), subjectType, subjectId));
    }

    /** {@code start()} anında henüz bilinmeyen {@code subjectId}'yi geriye dönük doldurur. */
    public ApprovalChainInstance assignSubject(Long instanceId, Long subjectId) {
        ApprovalChainInstance instance =
                chainInstanceRepository.findById(instanceId).orElseThrow(ApprovalChainInstanceNotFoundException::new);
        instance.assignSubjectId(subjectId);
        return chainInstanceRepository.save(instance);
    }

    /**
     * {@code expectedStepOrder}'daki adımı karara bağlar. Reddedilirse
     * zincir {@code REJECTED} olur; onaylanırsa SON adımsa {@code
     * APPROVED}, değilse bir sonraki adıma geçer.
     */
    public ApprovalChainInstance decide(Long instanceId, int expectedStepOrder, boolean approve) {
        ApprovalChainInstance instance =
                chainInstanceRepository.findById(instanceId).orElseThrow(ApprovalChainInstanceNotFoundException::new);

        if (instance.getStatus() != ApprovalChainInstanceStatus.IN_PROGRESS) {
            throw new IllegalArgumentException("Bu onay zinciri zaten sonuçlanmış.");
        }
        if (instance.getCurrentStepOrder() != expectedStepOrder) {
            throw new IllegalArgumentException("Beklenmeyen onay adımı.");
        }

        if (!approve) {
            instance.reject();
        } else if (expectedStepOrder >= stepDefinitionRepository.countByChainDefinitionId(instance.getChainDefinitionId())) {
            instance.approve();
        } else {
            instance.advanceToNextStep();
        }

        return chainInstanceRepository.save(instance);
    }
}
