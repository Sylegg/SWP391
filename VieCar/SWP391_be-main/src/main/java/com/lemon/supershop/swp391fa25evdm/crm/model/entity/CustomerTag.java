package com.lemon.supershop.swp391fa25evdm.crm.model.entity;

import java.time.LocalDateTime;

import com.lemon.supershop.swp391fa25evdm.dealer.model.entity.Dealer;
import com.lemon.supershop.swp391fa25evdm.user.model.entity.User;

import jakarta.persistence.*;

@Entity
@Table(name = "customer_tags")
public class CustomerTag {
    
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "Id", columnDefinition = "BIGINT")
    private int id;
    
    @Column(name = "tag", columnDefinition = "VARCHAR(50)")
    private String tag;
    
    @Column(name = "color", columnDefinition = "VARCHAR(20)")
    private String color; // e.g., "blue", "green", "red", "yellow"
    
    @Column(name = "created_at", columnDefinition = "DATETIME2")
    private LocalDateTime createdAt;
    
    // ===== Relations =====
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "UserId")
    private User user; // Customer being tagged
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "DealerId")
    private Dealer dealer; // Dealer where tag was created
    
    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
    
    // ===== Constructors =====
    
    public CustomerTag() {
    }
    
    public CustomerTag(User user, Dealer dealer, String tag, String color) {
        this.user = user;
        this.dealer = dealer;
        this.tag = tag;
        this.color = color;
    }
    
    // ===== Getters and Setters =====
    
    public int getId() {
        return id;
    }
    
    public void setId(int id) {
        this.id = id;
    }
    
    public String getTag() {
        return tag;
    }
    
    public void setTag(String tag) {
        this.tag = tag;
    }
    
    public String getColor() {
        return color;
    }
    
    public void setColor(String color) {
        this.color = color;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
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
