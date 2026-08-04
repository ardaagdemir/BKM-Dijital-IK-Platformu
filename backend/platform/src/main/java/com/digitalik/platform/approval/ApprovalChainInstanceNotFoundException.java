package com.digitalik.platform.approval;

public class ApprovalChainInstanceNotFoundException extends RuntimeException {

    public ApprovalChainInstanceNotFoundException() {
        super("Onay zinciri örneği bulunamadı.");
    }
}
