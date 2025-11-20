package com.lemon.supershop.swp391fa25evdm.distribution.model.entity;

// ❌ Xóa JsonIgnore - không dùng nữa
// import com.fasterxml.jackson.annotation.JsonIgnore;
import java.time.LocalDateTime;
import java.util.List;

import com.lemon.supershop.swp391fa25evdm.contract.model.entity.Contract;
import com.lemon.supershop.swp391fa25evdm.dealer.model.entity.Dealer;
import com.lemon.supershop.swp391fa25evdm.product.model.entity.Product;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

@Entity
@Table(name = "distribution")
public class Distribution {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Id", columnDefinition = "BIGINT")
    private int id;

    @Column(name = "Status", columnDefinition = "VARCHAR(20)")
    private String status; // INVITED, ACCEPTED, DECLINED, PENDING, CONFIRMED, CANCELED, PRICE_SENT, PRICE_ACCEPTED, PRICE_REJECTED, PLANNED, COMPLETED

    @Column(name = "ManufacturerPrice")
    private Double manufacturerPrice; // Giá hãng gửi cho dealer

    @Column(name = "ParentDistributionId")
    private Integer parentDistributionId; // ID của đơn gốc nếu đây là đơn bổ sung

    @Column(name = "IsSupplementary")
    private Boolean isSupplementary; // True nếu đây là đơn bổ sung số lượng thiếu

    @Column(name = "InvitationMessage", columnDefinition = "NVARCHAR(500)")
    private String invitationMessage;

    @Column(name = "DealerNotes", columnDefinition = "NVARCHAR(500)")
    private String dealerNotes;

    @Column(name = "EvmNotes", columnDefinition = "NVARCHAR(500)")
    private String evmNotes;

    @Column(name = "Feedback", columnDefinition = "NVARCHAR(500)")
    private String feedback;

    // Timeline - CHỈ GIỮ 2 FIELD ĐANG DÙNG
    @Column(name = "CreatedAt", columnDefinition = "DATETIME2")
    private LocalDateTime createdAt;

    @Column(name = "InvitedAt", columnDefinition = "DATETIME2")
    private LocalDateTime invitedAt;

    // Dates
    @Column(name = "Deadline", columnDefinition = "DATETIME2")
    private LocalDateTime deadline;

    @Column(name = "RequestedDeliveryDate", columnDefinition = "DATETIME2")
    private LocalDateTime requestedDeliveryDate;

    @Column(name = "EstimatedDeliveryDate", columnDefinition = "DATETIME2")
    private LocalDateTime estimatedDeliveryDate;

    @Column(name = "ActualDeliveryDate", columnDefinition = "DATETIME2")
    private LocalDateTime actualDeliveryDate;

    // Quantities - CHỈ GIỮ 2 FIELD ĐANG DÙNG
    @Column(name = "RequestedQuantity")
    private Integer requestedQuantity;

    @Column(name = "ReceivedQuantity")
    private Integer receivedQuantity;

    @OneToOne(mappedBy = "distribution")
    private Contract contract;

    //    @OneToMany(mappedBy = "distribution", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
//    private List<Product> products;

    @OneToMany(mappedBy = "distribution", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    private List<DistributionItem> items;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "DealerId")
    private Dealer dealer;



    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.status == null) {
            this.status = "INVITED";
        }
    }

    public Distribution() {
    }

    // Getters and Setters
    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Dealer getDealer() {
        return dealer;
    }

    public void setDealer(Dealer dealer) {
        this.dealer = dealer;
    }

    public Contract getContract() {
        return contract;
    }

    public void setContract(Contract contract) {
        this.contract = contract;
    }

//    public List<Product> getProducts() {
//        return products;
//    }
//
//    public void setProducts(List<Product> products) {
//        this.products = products;
//    }

    public List<DistributionItem> getItems() {
        return items;
    }

    public void setItems(List<DistributionItem> items) {
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

    public Boolean getSupplementary() {
        return isSupplementary;
    }

    public void setSupplementary(Boolean supplementary) {
        isSupplementary = supplementary;
    }


}
