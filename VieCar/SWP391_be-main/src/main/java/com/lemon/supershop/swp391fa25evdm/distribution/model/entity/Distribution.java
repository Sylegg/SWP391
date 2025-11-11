package com.lemon.supershop.swp391fa25evdm.distribution.model.entity;

// ❌ Xóa JsonIgnore - không dùng nữa
// import com.fasterxml.jackson.annotation.JsonIgnore;
import com.lemon.supershop.swp391fa25evdm.dealer.model.entity.Dealer;
import com.lemon.supershop.swp391fa25evdm.product.model.entity.Product;
import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.List;

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

    // ❌ Xóa Category - không sử dụng, Dealer đã có Category
    // @ManyToOne(fetch = FetchType.LAZY)
    // @JoinColumn(name = "CategoryId")
    // @JsonIgnore
    // private Category category;

    @OneToMany(mappedBy = "distribution", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private List<Product> products;

    @OneToMany(mappedBy = "distribution", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    private List<DistributionItem> items;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "DealerId")
    private Dealer dealer;

    // Parent Distribution (for supplementary orders)
    @Column(name = "ParentDistributionId")
    private Integer parentDistributionId; // ID của đơn gốc nếu đây là đơn bổ sung
    
    @Column(name = "IsSupplementary")
    private Boolean isSupplementary; // True nếu đây là đơn bổ sung số lượng thiếu

    // ❌ Xóa Contract - không sử dụng
    // @OneToOne(mappedBy = "distribution")
    // private Contract contract;

    // Messages & Notes
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

    // ❌ Xóa các timeline không dùng
    // @Column(name = "RespondedAt", columnDefinition = "DATETIME2")
    // private LocalDateTime respondedAt;
    // @Column(name = "SubmittedAt", columnDefinition = "DATETIME2")
    // private LocalDateTime submittedAt;
    // @Column(name = "ApprovedAt", columnDefinition = "DATETIME2")
    // private LocalDateTime approvedAt;
    // @Column(name = "PlannedAt", columnDefinition = "DATETIME2")
    // private LocalDateTime plannedAt;
    // @Column(name = "CompletedAt", columnDefinition = "DATETIME2")
    // private LocalDateTime completedAt;

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

    // ❌ Xóa quantities không dùng
    // @Column(name = "ApprovedQuantity")
    // private Integer approvedQuantity;
    // @Column(name = "ActualQuantity")
    // private Integer actualQuantity;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.status == null) {
            this.status = "INVITED";
        }
    }

    public Distribution() {}

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

    // ❌ Xóa Category getter/setter - không dùng
    // public Category getCategory() { return category; }
    // public void setCategory(Category category) { this.category = category; }

    public Dealer getDealer() {
        return dealer;
    }

    public void setDealer(Dealer dealer) {
        this.dealer = dealer;
    }

    // ❌ Xóa Contract getter/setter
    // public Contract getContract() { return contract; }
    // public void setContract(Contract contract) { this.contract = contract; }

    public List<Product> getProducts() {
        return products;
    }

    public void setProducts(List<Product> products) {
        this.products = products;
    }

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
