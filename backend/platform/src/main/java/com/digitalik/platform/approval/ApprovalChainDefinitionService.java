package com.digitalik.platform.approval;

import java.util.List;
import org.springframework.stereotype.Service;

/**
 * US-09.2.2 kabul kriteri: "Sistem yöneticisi olarak, yeni bir onay
 * zincirini kod yazmadan tanımlamak istiyorum. Zincir adım sayısı/
 * onaylayıcı rolü ekrandan yapılandırılır." Hiçbir modülde henüz bir admin
 * ekranı yok — bu, projenin Bölüm 1-8 boyunca izlediği "önce backend API,
 * ekran sonra" deseniyle yalnızca bir REST API olarak karşılanıyor (bkz.
 * {@code ApprovalChainDefinitionController}).
 */
@Service
public class ApprovalChainDefinitionService {

    private final ApprovalChainDefinitionRepository chainDefinitionRepository;
    private final ApprovalChainStepDefinitionRepository stepDefinitionRepository;

    public ApprovalChainDefinitionService(
            ApprovalChainDefinitionRepository chainDefinitionRepository,
            ApprovalChainStepDefinitionRepository stepDefinitionRepository) {
        this.chainDefinitionRepository = chainDefinitionRepository;
        this.stepDefinitionRepository = stepDefinitionRepository;
    }

    public ApprovalChainDefinition create(String name, List<String> orderedRequiredRoles) {
        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("Zincir adı boş olamaz.");
        }
        if (orderedRequiredRoles == null || orderedRequiredRoles.isEmpty()) {
            throw new IllegalArgumentException("En az bir adım gereklidir.");
        }
        if (chainDefinitionRepository.findByName(name).isPresent()) {
            throw new IllegalArgumentException("Bu adla bir onay zinciri zaten var.");
        }

        ApprovalChainDefinition definition = chainDefinitionRepository.save(new ApprovalChainDefinition(name));
        saveSteps(definition.getId(), orderedRequiredRoles);
        return definition;
    }

    public List<ApprovalChainDefinition> getAll() {
        return chainDefinitionRepository.findAll();
    }

    public List<ApprovalChainStepDefinition> getSteps(Long chainDefinitionId) {
        return stepDefinitionRepository.findByChainDefinitionIdOrderByStepOrderAsc(chainDefinitionId);
    }

    /** Var olan bir zincirin adım listesini (sayı/rol) TAMAMEN değiştirir. */
    public ApprovalChainDefinition updateSteps(Long chainDefinitionId, List<String> orderedRequiredRoles) {
        ApprovalChainDefinition definition = chainDefinitionRepository
                .findById(chainDefinitionId)
                .orElseThrow(ApprovalChainDefinitionNotFoundException::new);
        if (orderedRequiredRoles == null || orderedRequiredRoles.isEmpty()) {
            throw new IllegalArgumentException("En az bir adım gereklidir.");
        }

        stepDefinitionRepository.deleteAll(getSteps(chainDefinitionId));
        saveSteps(chainDefinitionId, orderedRequiredRoles);
        return definition;
    }

    private void saveSteps(Long chainDefinitionId, List<String> orderedRequiredRoles) {
        int stepOrder = 1;
        for (String role : orderedRequiredRoles) {
            stepDefinitionRepository.save(new ApprovalChainStepDefinition(chainDefinitionId, stepOrder++, role));
        }
    }
}
