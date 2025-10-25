package com.lemon.supershop.swp391fa25evdm.distribution.model.dto;

public class DistributionApprovalReq {
    private String decision; // "CONFIRMED" or "CANCELED"
    // ❌ Xóa: private Integer approvedQuantity;
    private String evmNotes;

    public DistributionApprovalReq() {}

    public String getDecision() {
        return decision;
    }

    public void setDecision(String decision) {
        this.decision = decision;
    }

    // ❌ Xóa approvedQuantity getter/setter
    // public Integer getApprovedQuantity() { return approvedQuantity; }
    // public void setApprovedQuantity(Integer approvedQuantity) { this.approvedQuantity = approvedQuantity; }

    public String getEvmNotes() {
        return evmNotes;
    }

    public void setEvmNotes(String evmNotes) {
        this.evmNotes = evmNotes;
    }
}
