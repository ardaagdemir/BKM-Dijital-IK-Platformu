package com.digitalik.platform.approval;

public class ApprovalChainDefinitionNotFoundException extends RuntimeException {

    public ApprovalChainDefinitionNotFoundException() {
        super("Onay zinciri tanımı bulunamadı.");
    }
}
