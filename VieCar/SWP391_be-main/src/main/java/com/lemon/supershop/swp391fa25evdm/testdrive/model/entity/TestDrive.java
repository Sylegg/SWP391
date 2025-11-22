package com.lemon.supershop.swp391fa25evdm.testdrive.model.entity;

import java.time.LocalDateTime;
import java.util.Date;

import com.lemon.supershop.swp391fa25evdm.category.model.entity.Category;
import com.lemon.supershop.swp391fa25evdm.dealer.model.entity.Dealer;
import com.lemon.supershop.swp391fa25evdm.product.model.entity.Product;
import com.lemon.supershop.swp391fa25evdm.user.model.entity.User;

import jakarta.persistence.*;

@Entity
@Table(name = "testdrive")
public class TestDrive {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "Id", columnDefinition = "BIGINT")
    private int id;

    @Column(name = "schedule_date", columnDefinition = "DATETIME2")
    private LocalDateTime scheduleDate;

    @Column(name = "Status", columnDefinition = "VARCHAR(20)")
    private String status; // PENDING, ASSIGNING, APPROVED, IN_PROGRESS, DONE, REJECTED, CANCELLED

    @Column(name = "notes", columnDefinition = "NVARCHAR(MAX)")
    private String notes;

    @Column(name = "specific_vin", columnDefinition = "VARCHAR(50)")
    private String specificVIN;
    
    @Column(name = "product_model_name", columnDefinition = "NVARCHAR(100)")
    private String productModelName; // Model name chosen by customer (e.g., "VF8", "VF9")
    
    @Column(name = "attempt_number", columnDefinition = "INT DEFAULT 1", nullable = false)
    private Integer attemptNumber = 1; // Số lần đăng ký lái thử category này (1 = lần đầu, 2 = lần 2, ...)

    @Column(insertable = false, updatable = false, name = "Create_at", columnDefinition = "DATETIME2 DEFAULT GETDATE()" )
    @Temporal(TemporalType.TIMESTAMP)
    private Date createAt;

    @PrePersist
    protected void onCreate() {
        this.createAt = new Date();
        // Set default attemptNumber nếu null
        if (this.attemptNumber == null) {
            this.attemptNumber = 1;
        }
    }

    // ===== Relation =====

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "UserId")
    private User user;  // khách hàng đặt test drive

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "DealerId")
    private Dealer dealer; // đại lý tổ chức test drive

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ProductId")
    private Product product;  // Xe cụ thể được assign bởi dealer staff (nullable khi customer tạo yêu cầu)
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "CategoryId")
    private Category category;  // Model xe mà customer chọn
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "EscortStaffId")
    private User escortStaff;  // Staff được assign để đi cùng customer

    public TestDrive() {
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public LocalDateTime getScheduleDate() {
        return scheduleDate;
    }

    public void setScheduleDate(LocalDateTime scheduleDate) {
        this.scheduleDate = scheduleDate;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public String getSpecificVIN() {
        return specificVIN;
    }

    public void setSpecificVIN(String specificVIN) {
        this.specificVIN = specificVIN;
    }

    public Date getCreateAt() {
        return createAt;
    }

    public void setCreateAt(Date createAt) {
        this.createAt = createAt;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Dealer getDealer() {
        return dealer;
    }

    public void setDealer(Dealer dealer) {
        this.dealer = dealer;
    }

    public Product getProduct() {
        return product;
    }

    public void setProduct(Product product) {
        this.product = product;
    }
    
    public Category getCategory() {
        return category;
    }

    public void setCategory(Category category) {
        this.category = category;
    }
    
    public User getEscortStaff() {
        return escortStaff;
    }

    public void setEscortStaff(User escortStaff) {
        this.escortStaff = escortStaff;
    }
    
    public String getProductModelName() {
        return productModelName;
    }

    public void setProductModelName(String productModelName) {
        this.productModelName = productModelName;
    }
    
    public Integer getAttemptNumber() {
        return attemptNumber;
    }

    public void setAttemptNumber(Integer attemptNumber) {
        this.attemptNumber = attemptNumber;
    }
}
