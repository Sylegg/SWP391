package com.lemon.supershop.swp391fa25evdm.contract.model.entity;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.lemon.supershop.swp391fa25evdm.distribution.model.entity.Distribution;
import com.lemon.supershop.swp391fa25evdm.order.model.entity.Order;
import com.lemon.supershop.swp391fa25evdm.preorder.model.entity.PreOrder;
import com.lemon.supershop.swp391fa25evdm.user.model.entity.User;

import jakarta.persistence.*;


@Entity
@Table(name = "contract")
public class Contract {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Id", columnDefinition = "BIGINT")
    private int id;

    @Column(name = "SignDate", columnDefinition = "DATETIME2")
    private LocalDateTime signedDate;

    @Column(name = "FileUrl", columnDefinition = "VARCHAR(255)")
    private String fileUrl; // link PDF hợp đồng lưu trên server

    @ManyToOne
    @JoinColumn(name = "OrderId")
    @JsonIgnore
    private Order order;

    @ManyToOne
    @JoinColumn(name = "PreOrderId")
    @JsonIgnore
    private PreOrder preOrder;

    @ManyToOne
    @JoinColumn(name = "UserId")
    @JsonIgnore
    private User user;

    @Column(name = "Status", columnDefinition = "VARCHAR(50)")
    private String status;

    @OneToOne()
    @JoinColumn(name = "DistributionId")
    private Distribution distribution;

    public Contract() {
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public LocalDateTime getSignedDate() {
        return signedDate;
    }

    public void setSignedDate(LocalDateTime signedDate) {
        this.signedDate = signedDate;
    }

    public String getFileUrl() {
        return fileUrl;
    }

    public void setFileUrl(String fileUrl) {
        this.fileUrl = fileUrl;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Order getOrder() {
        return order;
    }

    public void setOrder(Order order) {
        this.order = order;
    }

    public PreOrder getPreOrder() {
        return preOrder;
    }

    public void setPreOrder(PreOrder preOrder) {
        this.preOrder = preOrder;
    }

    public Distribution getDistribution() {
        return distribution;
    }

    public void setDistribution(Distribution distribution) {
        this.distribution = distribution;
    }
}
