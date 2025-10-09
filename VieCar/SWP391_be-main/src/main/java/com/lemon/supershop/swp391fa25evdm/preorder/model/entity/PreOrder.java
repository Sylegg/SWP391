package com.lemon.supershop.swp391fa25evdm.preorder.model.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.lemon.supershop.swp391fa25evdm.contract.model.entity.Contract;
import com.lemon.supershop.swp391fa25evdm.order.model.entity.Order;
import com.lemon.supershop.swp391fa25evdm.payment.model.entity.Payment;
import com.lemon.supershop.swp391fa25evdm.product.model.entity.Product;
import com.lemon.supershop.swp391fa25evdm.user.model.entity.User;
import jakarta.persistence.*;

import java.util.Date;
import java.util.List;

@Entity
@Table(name = "preorder")
public class PreOrder {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Id", columnDefinition = "BIGINT")
    private int id;

    @ManyToOne
    @JoinColumn(name = "UserId")
    @JsonIgnore
    private User user;

    @ManyToOne
    @JoinColumn(name = "ProductId")
    @JsonIgnore
    private Product product;

    @OneToMany(mappedBy = "preOrder", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private List<Contract> contract;

    @Column(name = "OrderDate", columnDefinition = "DATETIME2")
    private Date orderDate;

    @Column(name = "Status", columnDefinition = "VARCHAR(20)")
    private String status;

    @Column(name = "Deposit", columnDefinition = "DECIMAL(18,2)")
    private double deposit;

    @OneToOne(mappedBy = "preOrder", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private Payment payments;

    public PreOrder() {}

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Date getOrderDate() {
        return orderDate;
    }

    public void setOrderDate(Date order_date) {
        this.orderDate = order_date;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public double getDeposit() {
        return deposit;
    }

    public void setDeposit(double total) {
        this.deposit = total;
    }

    public Payment getPayments() {
        return payments;
    }

    public void setPayments(Payment payments) {
        this.payments = payments;
    }

    public Product getProduct() {
        return product;
    }

    public void setProduct(Product product) {
        this.product = product;
    }

    public List<Contract> getContract() {
        return contract;
    }

    public void setContract(List<Contract> contract) {
        this.contract = contract;
    }
}
