package com.lemon.supershop.swp391fa25evdm.order.model.entity;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.lemon.supershop.swp391fa25evdm.contract.model.entity.Contract;
import com.lemon.supershop.swp391fa25evdm.dealer.model.entity.Dealer;
import com.lemon.supershop.swp391fa25evdm.payment.model.entity.Payment;
import com.lemon.supershop.swp391fa25evdm.product.model.entity.Product;
import com.lemon.supershop.swp391fa25evdm.promotion.model.entity.Promotion;
import com.lemon.supershop.swp391fa25evdm.user.model.entity.User;

import jakarta.persistence.*;

@Entity
@Table(name = "orders")
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Id", columnDefinition = "BIGINT")
    private int id;

    @Column(name = "Status", columnDefinition = "NVARCHAR(50)")
    private String status;

    @Column(name = "Total", columnDefinition = "DECIMAL(18,2)")
    private double total;

    @Column(name = "ShipAddress", columnDefinition = "NVARCHAR(255)")
    private String shipAddress;

    @Column(name = "ShipStatus", columnDefinition = "VARCHAR(20)")
    private String shipStatus;

    @Column(name = "ShipAt", columnDefinition = "DATETIME2")
    private Date shipAt;

    @ManyToOne
    @JoinColumn(name = "UserId")
    @JsonIgnore
    private User user;

    @ManyToOne
    @JoinColumn(name = "ProductId")
    private Product product;

    @Column(insertable = false, updatable = false, name = "OrderDate", columnDefinition = "DATETIME2 DEFAULT GETDATE()" )
    @Temporal(TemporalType.TIMESTAMP)
    private Date orderDate;

    @Column(name = "DeliveryDate", columnDefinition = "DATETIME2")
    @Temporal(TemporalType.TIMESTAMP)
    private Date deliveryDate;

    @PrePersist
    protected void onCreate() {
        this.orderDate = new Date();
    }

    @OneToMany(mappedBy = "order", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private List<Payment> payments = new ArrayList<>();

    @OneToMany(mappedBy = "order", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private List<Promotion> promotions = new ArrayList<>();

    @OneToMany(mappedBy = "order", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private List<Contract> contract;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "DealerId")
    private Dealer dealer;

    public Order() {}

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

    public double getTotal() {
        return total;
    }

    public void setTotal(double total) {
        this.total = total;
    }

    public List<Payment> getPayments() {
        return payments;
    }

    public void setPayments(List<Payment> payments) {
        this.payments = payments;
    }

    public Date getShipAt() {
        return shipAt;
    }

    public List<Contract> getContract() {
        return contract;
    }

    public void setContract(List<Contract> contract) {
        this.contract = contract;
    }

    public String getShipAddress() {
        return shipAddress;
    }

    public void setShipAddress(String ship_address) {
        this.shipAddress = ship_address;
    }

    public String getShipStatus() {
        return shipStatus;
    }

    public void setShipStatus(String delivery_status) {
        this.shipStatus = delivery_status;
    }

    public Date getShipAt(Date shipDate) {
        return shipAt;
    }

    public void setShipAt(Date shipAt) {
        this.shipAt = shipAt;
    }

    public Product getProduct() {
        return product;
    }

    public void setProduct(Product product) {
        this.product = product;
    }

    public List<Promotion> getPromotions() {
        return promotions;
    }

    public void setPromotions(List<Promotion> promotions) {
        this.promotions = promotions;
    }

    public Dealer getDealer() {
        return dealer;
    }

    public void setDealer(Dealer dealer) {
        this.dealer = dealer;
    }

    public Date getDeliveryDate() {
        return deliveryDate;
    }

    public void setDeliveryDate(Date deliveryDate) {
        this.deliveryDate = deliveryDate;
    }
}
