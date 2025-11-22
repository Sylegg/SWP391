package com.lemon.supershop.swp391fa25evdm.distribution.model.dto;

// ❌ Xóa CategoryRes import - không dùng
// import com.lemon.supershop.swp391fa25evdm.category.model.dto.CategoryRes;
import com.lemon.supershop.swp391fa25evdm.dealer.model.dto.DealerRes;
import com.lemon.supershop.swp391fa25evdm.product.model.dto.ProductRes;

import java.time.LocalDateTime;
import java.util.List;

public class DistributionRes {

    private Integer id;
    private String code; // Mã phân phối (PP2025-0013)
    private String status;
    // ❌ Xóa category - không dùng
    // private CategoryRes category;
    private DealerRes dealer;
    private List<ProductRes> products;
    private List<DistributionItemRes> items;
    
    // Messages/Notes
    private String invitationMessage;
    private String dealerNotes;
    private String evmNotes;
    private String feedback;
    
    // Timeline - CHỈ 2 FIELD ĐANG DÙNG
    private LocalDateTime createdAt;
    private LocalDateTime invitedAt;
    // ❌ Xóa 5 timeline fields không dùng
    // private LocalDateTime respondedAt;
    // private LocalDateTime submittedAt;
    // private LocalDateTime approvedAt;
    // private LocalDateTime plannedAt;
    // private LocalDateTime completedAt;
    
    // Dates
    private LocalDateTime deadline;
    private LocalDateTime requestedDeliveryDate;
    private LocalDateTime estimatedDeliveryDate;
    private LocalDateTime actualDeliveryDate;
    
    // Quantities - CHỈ 2 FIELD ĐANG DÙNG
    private Integer requestedQuantity;
    private Integer receivedQuantity;
    // ❌ Xóa 2 quantity fields không dùng
    // private Integer approvedQuantity;
    // private Integer actualQuantity;

    private Double manufacturerPrice; // Giá hãng gửi cho dealer

    // Supplementary order fields
    private Integer parentDistributionId;  // ID của đơn gốc nếu đây là đơn bổ sung
    private Boolean isSupplementary;       // True nếu đây là đơn bổ sung số lượng thiếu

    public DistributionRes() {}

    // Getters and Setters
    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    // ❌ Xóa category getter/setter - không dùng
    // public CategoryRes getCategory() { return category; }
    // public void setCategory(CategoryRes category) { this.category = category; }

    public DealerRes getDealer() {
        return dealer;
    }

    public void setDealer(DealerRes dealer) {
        this.dealer = dealer;
    }

    public List<ProductRes> getProducts() {
        return products;
    }

    public void setProducts(List<ProductRes> products) {
        this.products = products;
    }

    public List<DistributionItemRes> getItems() {
        return items;
    }

    public void setItems(List<DistributionItemRes> items) {
        this.items = items;
    }

    public String getInvitationMessage() {
        return invitationMessage;
    }

    public void setInvitationMessage(String invitationMessage) {
        this.invitationMessage = invitationMessage;
    }

    public String getDealerNotes() {
        return dealerNotes;
    }

    public void setDealerNotes(String dealerNotes) {
        this.dealerNotes = dealerNotes;
    }

    public String getEvmNotes() {
        return evmNotes;
    }

    public void setEvmNotes(String evmNotes) {
        this.evmNotes = evmNotes;
    }

    public String getFeedback() {
        return feedback;
    }

    public void setFeedback(String feedback) {
        this.feedback = feedback;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getInvitedAt() {
        return invitedAt;
    }

    public void setInvitedAt(LocalDateTime invitedAt) {
        this.invitedAt = invitedAt;
    }

    // ❌ Xóa 5 timeline getters/setters không dùng
    // public LocalDateTime getRespondedAt() { return respondedAt; }
    // public void setRespondedAt(LocalDateTime respondedAt) { this.respondedAt = respondedAt; }
    // public LocalDateTime getSubmittedAt() { return submittedAt; }
    // public void setSubmittedAt(LocalDateTime submittedAt) { this.submittedAt = submittedAt; }
    // public LocalDateTime getApprovedAt() { return approvedAt; }
    // public void setApprovedAt(LocalDateTime approvedAt) { this.approvedAt = approvedAt; }
    // public LocalDateTime getPlannedAt() { return plannedAt; }
    // public void setPlannedAt(LocalDateTime plannedAt) { this.plannedAt = plannedAt; }
    // public LocalDateTime getCompletedAt() { return completedAt; }
    // public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }

    public LocalDateTime getDeadline() {
        return deadline;
    }

    public void setDeadline(LocalDateTime deadline) {
        this.deadline = deadline;
    }

    public LocalDateTime getRequestedDeliveryDate() {
        return requestedDeliveryDate;
    }

    public void setRequestedDeliveryDate(LocalDateTime requestedDeliveryDate) {
        this.requestedDeliveryDate = requestedDeliveryDate;
    }

    public LocalDateTime getEstimatedDeliveryDate() {
        return estimatedDeliveryDate;
    }

    public void setEstimatedDeliveryDate(LocalDateTime estimatedDeliveryDate) {
        this.estimatedDeliveryDate = estimatedDeliveryDate;
    }

    public LocalDateTime getActualDeliveryDate() {
        return actualDeliveryDate;
    }

    public void setActualDeliveryDate(LocalDateTime actualDeliveryDate) {
        this.actualDeliveryDate = actualDeliveryDate;
    }

    public Integer getRequestedQuantity() {
        return requestedQuantity;
    }

    public void setRequestedQuantity(Integer requestedQuantity) {
        this.requestedQuantity = requestedQuantity;
    }

    // ❌ Xóa 2 quantity getters/setters không dùng
    // public Integer getApprovedQuantity() { return approvedQuantity; }
    // public void setApprovedQuantity(Integer approvedQuantity) { this.approvedQuantity = approvedQuantity; }
    // public Integer getActualQuantity() { return actualQuantity; }
    // public void setActualQuantity(Integer actualQuantity) { this.actualQuantity = actualQuantity; }

    public Integer getReceivedQuantity() {
        return receivedQuantity;
    }

    public void setReceivedQuantity(Integer receivedQuantity) {
        this.receivedQuantity = receivedQuantity;
    }

    public Double getManufacturerPrice() {
        return manufacturerPrice;
    }

    public void setManufacturerPrice(Double manufacturerPrice) {
        this.manufacturerPrice = manufacturerPrice;
    }

    public Integer getParentDistributionId() {
        return parentDistributionId;
    }

    public void setParentDistributionId(Integer parentDistributionId) {
        this.parentDistributionId = parentDistributionId;
    }

    public Boolean getIsSupplementary() {
        return isSupplementary;
    }

    public void setIsSupplementary(Boolean isSupplementary) {
        this.isSupplementary = isSupplementary;
    }
}

