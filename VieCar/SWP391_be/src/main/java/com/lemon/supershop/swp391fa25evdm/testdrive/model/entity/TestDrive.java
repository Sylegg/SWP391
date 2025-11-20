package com.lemon.supershop.swp391fa25evdm.testdrive.model.entity;

import java.time.LocalDateTime;
import java.util.Date;

import com.lemon.supershop.swp391fa25evdm.category.model.entity.Category;
import com.lemon.supershop.swp391fa25evdm.dealer.model.entity.Dealer;
import com.lemon.supershop.swp391fa25evdm.product.model.entity.Product;
import com.lemon.supershop.swp391fa25evdm.user.model.entity.User;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.Temporal;
import jakarta.persistence.TemporalType;

@Entity
@Table(name = "testdrive")
public class TestDrive {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "Id", columnDefinition = "BIGINT")
    private int id;

    @Column(name = "schedule_date", columnDefinition = "DATETIME2")
    private LocalDateTime scheduleDate;

    // ⚠️ COMMENTED OUT: Database column 'location' does not exist
    // Uncomment after running migration to add this column
    // @Column(name = "location", columnDefinition = "NVARCHAR(255)")
    // private String location;

    @Column(name = "status", columnDefinition = "VARCHAR(20)")
    private String status; // PENDING, ASSIGNING, APPROVED, IN_PROGRESS, DONE, REJECTED, CANCELLED

    @Column(name = "notes", columnDefinition = "NVARCHAR(MAX)")
    private String notes;

    @Column(name = "specific_vin", columnDefinition = "VARCHAR(50)")
    private String specificVIN;

    @Column(name = "product_model_name", columnDefinition = "NVARCHAR(100)")
    private String productModelName;

//    @Column(name = "product_model_name", columnDefinition = "NVARCHAR(100)")
//    private String productModelName;

    @Column(insertable = false, updatable = false, name = "Create_at", columnDefinition = "DATETIME2 DEFAULT GETDATE()" )
    @Temporal(TemporalType.TIMESTAMP)
    private Date createAt;

    @PrePersist
    protected void onCreate() {
        this.createAt = new Date();
    }

    // ===== Relation =====

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "UserId")
    private User user;  // khách hàng đặt test drive

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "EscortStaffId") // nhân viên đi kèm
    private User escortStaff;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "DealerId")
    private Dealer dealer; // đại lý tổ chức test drive

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "CategoryId")
    private Category category;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ProductId")
    private Product product; //

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

    // ⚠️ COMMENTED OUT: Getter/Setter for location (column not in database)
    // public String getLocation() {
    //     return location;
    // }
    //
    // public void setLocation(String location) {
    //     this.location = location;
    // }

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

    public String getSpecificVIN() {
        return specificVIN;
    }

    public void setSpecificVIN(String specificVIN) {
        this.specificVIN = specificVIN;
    }

    public Category getCategory() {
        return category;
    }

    public void setCategory(Category category) {
        this.category = category;
    }

    public Product getProduct() {
        return product;
    }

    public void setProduct(Product product) {
        this.product = product;
    }

    public String getProductModelName() {
        return productModelName;
    }

    public void setProductModelName(String productModelName) {
        this.productModelName = productModelName;
    }

    public User getEscortStaff() {
        return escortStaff;
    }

    public void setEscortStaff(User escortStaff) {
        this.escortStaff = escortStaff;
    }
}
