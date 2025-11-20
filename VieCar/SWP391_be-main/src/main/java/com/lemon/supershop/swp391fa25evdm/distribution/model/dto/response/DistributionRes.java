package com.lemon.supershop.swp391fa25evdm.distribution.model.dto.response;

import java.time.LocalDateTime;
import java.util.List;

import com.lemon.supershop.swp391fa25evdm.dealer.model.dto.DealerRes;
import com.lemon.supershop.swp391fa25evdm.product.model.dto.ProductRes;

public class DistributionRes {

    private Integer id;
    private String code; // Mã phân phối (PP2025-0013)
    private String status;
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

    // Dates
    private LocalDateTime deadline;
    private LocalDateTime requestedDeliveryDate;
    private LocalDateTime estimatedDeliveryDate;
    private LocalDateTime actualDeliveryDate;

    // Quantities - CHỈ 2 FIELD ĐANG DÙNG
    private Integer requestedQuantity;
    private Integer receivedQuantity;
    private Double manufacturerPrice; // Giá hãng gửi cho dealer

<<<<<<< HEAD:VieCar/SWP391_be-main/src/main/java/com/lemon/supershop/swp391fa25evdm/distribution/model/dto/response/DistributionRes.java
    public DistributionRes() {
    }
=======
    private Double manufacturerPrice; // Giá hãng gửi cho dealer

    // Supplementary order fields
    private Integer parentDistributionId;  // ID của đơn gốc nếu đây là đơn bổ sung
    private Boolean isSupplementary;       // True nếu đây là đơn bổ sung số lượng thiếu

    // Payment information
    private Double paidAmount;             // Số tiền đã thanh toán
    private String transactionNo;          // Mã giao dịch VNPay
    private LocalDateTime paidAt;          // Thời gian thanh toán

    public DistributionRes() {}
>>>>>>> f80fcac20c192e521fe159a9f41c5d8b008885b9:VieCar/SWP391_be-main/src/main/java/com/lemon/supershop/swp391fa25evdm/distribution/model/dto/DistributionRes.java

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

    public Integer getReceivedQuantity() {
        return receivedQuantity;
    }

    public void setReceivedQuantity(Integer receivedQuantity) {
        this.receivedQuantity = receivedQuantity;
    }
<<<<<<< HEAD:VieCar/SWP391_be-main/src/main/java/com/lemon/supershop/swp391fa25evdm/distribution/model/dto/response/DistributionRes.java
=======

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

    public Double getPaidAmount() {
        return paidAmount;
    }

    public void setPaidAmount(Double paidAmount) {
        this.paidAmount = paidAmount;
    }

    public String getTransactionNo() {
        return transactionNo;
    }

    public void setTransactionNo(String transactionNo) {
        this.transactionNo = transactionNo;
    }

    public LocalDateTime getPaidAt() {
        return paidAt;
    }

    public void setPaidAt(LocalDateTime paidAt) {
        this.paidAt = paidAt;
    }
}
>>>>>>> f80fcac20c192e521fe159a9f41c5d8b008885b9:VieCar/SWP391_be-main/src/main/java/com/lemon/supershop/swp391fa25evdm/distribution/model/dto/DistributionRes.java

    public Double getManufacturerPrice() {
        return manufacturerPrice;
    }

    public void setManufacturerPrice(Double manufacturerPrice) {
        this.manufacturerPrice = manufacturerPrice;
    }
}
