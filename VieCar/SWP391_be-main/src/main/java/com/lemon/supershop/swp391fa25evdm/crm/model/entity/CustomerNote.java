package com.lemon.supershop.swp391fa25evdm.crm.model.entity;

import java.time.LocalDateTime;

import com.lemon.supershop.swp391fa25evdm.dealer.model.entity.Dealer;
import com.lemon.supershop.swp391fa25evdm.user.model.entity.User;

import jakarta.persistence.*;

@Entity
@Table(name = "customer_notes")
public class CustomerNote {
    
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "Id", columnDefinition = "BIGINT")
    private int id;
    
    @Column(name = "content", columnDefinition = "NVARCHAR(MAX)")
    private String content;
    
    @Column(name = "created_at", columnDefinition = "DATETIME2")
    private LocalDateTime createdAt;
    
    @Column(name = "created_by", columnDefinition = "VARCHAR(100)")
    private String createdBy; // Username of staff who created the note
    
    // ===== Relations =====
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "UserId")
    private User user; // Customer being noted about
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "DealerId")
    private Dealer dealer; // Dealer where note was created
    
    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
    
    // ===== Constructors =====
    
    public CustomerNote() {
    }
    
    public CustomerNote(User user, Dealer dealer, String content, String createdBy) {
        this.user = user;
        this.dealer = dealer;
        this.content = content;
        this.createdBy = createdBy;
    }
    
    // ===== Getters and Setters =====
    
    public int getId() {
        return id;
    }
    
    public void setId(int id) {
        this.id = id;
    }
    
    public String getContent() {
        return content;
    }
    
    public void setContent(String content) {
        this.content = content;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public String getCreatedBy() {
        return createdBy;
    }
    
    public void setCreatedBy(String createdBy) {
        this.createdBy = createdBy;
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
}
