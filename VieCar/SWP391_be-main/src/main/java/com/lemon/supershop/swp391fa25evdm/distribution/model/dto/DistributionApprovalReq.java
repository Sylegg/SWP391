package com.lemon.supershop.swp391fa25evdm.distribution.model.dto;

public class DistributionApprovalReq {
    private String decision; // "CONFIRMED" or "CANCELED"
    // ❌ Xóa: private Integer approvedQuantity;
    private String evmNotes;
    private Integer approvedQuantity; // Số lượng EVM duyệt (có thể != requestedQuantity)
    private Double manufacturerPrice; // Giá hãng gửi cho dealer (bắt buộc nếu CONFIRMED)

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

    public Integer getApprovedQuantity() {
        return approvedQuantity;
    }

    public void setApprovedQuantity(Integer approvedQuantity) {
        this.approvedQuantity = approvedQuantity;
    }

    public Double getManufacturerPrice() {
        return manufacturerPrice;
    }

    public void setManufacturerPrice(Double manufacturerPrice) {
        this.manufacturerPrice = manufacturerPrice;
    }

    public String getEvmNotes() {
        return evmNotes;
    }

    public void setEvmNotes(String evmNotes) {
        this.evmNotes = evmNotes;
    }
}
