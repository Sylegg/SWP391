package com.lemon.supershop.swp391fa25evdm.user.model.entity;

import java.util.Date;
import java.util.List;

import com.lemon.supershop.swp391fa25evdm.contract.model.entity.Contract;
import com.lemon.supershop.swp391fa25evdm.dealer.model.entity.Dealer;
import com.lemon.supershop.swp391fa25evdm.feedback.model.entity.Feedback;
import com.lemon.supershop.swp391fa25evdm.order.model.entity.Order;
import com.lemon.supershop.swp391fa25evdm.payment.model.entity.Payment;
import com.lemon.supershop.swp391fa25evdm.preorder.model.entity.PreOrder;
import com.lemon.supershop.swp391fa25evdm.role.model.entity.Role;
import com.lemon.supershop.swp391fa25evdm.testdrive.model.entity.TestDrive;
import com.lemon.supershop.swp391fa25evdm.user.model.enums.UserStatus;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.Temporal;
import jakarta.persistence.TemporalType;

@Entity
@Table(name = "users")
public class User {

    @Id
    // @GeneratedValue(strategy = GenerationType.AUTO)
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Id", columnDefinition = "BIGINT")
    private int id;

    @Column(name = "Username", columnDefinition = "VARCHAR(50)")
    private String username;

    @Column(name = "Password", columnDefinition = "VARCHAR(50)")
    private String password;

    @Column(name = "Email", columnDefinition = "VARCHAR(50)")
    private String email;

    @Column(name = "Phone", columnDefinition = "VARCHAR(11)")
    private String phone;

    @Column(name = "Address", columnDefinition = "NVARCHAR(255)")
    private String address;

    @Column(name = "IsBlack")
    private boolean isBlack;

    @Column(name = "Status", columnDefinition = "NVARCHAR(20)")
    @Enumerated(EnumType.STRING)
    private UserStatus status;

    @Column(insertable = false, updatable = false, name = "Create_at", columnDefinition = "DATETIME2 DEFAULT GETDATE()" )
    @Temporal(TemporalType.TIMESTAMP)
    private Date createAt;

    @PrePersist
    protected void onCreate() {
        this.createAt = new Date();
    }

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "RoleId")
    private Role role;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "DealerId")
    private Dealer dealer;

    @OneToMany(mappedBy = "user", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private List<Order> orders;

    @OneToMany(mappedBy = "user", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private List<PreOrder> preOrders;

    @OneToMany(mappedBy = "user", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private List<Payment> payments;

    @OneToMany(mappedBy = "user", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private List<Feedback> feedbacks;

    @OneToMany(mappedBy = "user", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private List<TestDrive> testDrives;

    @OneToMany(mappedBy = "escortStaff", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private List<TestDrive> escortedTestDrives;

    @OneToMany(mappedBy = "user", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private List<Contract> contracts;

    public User() {
    }



    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public Date getCreateAt() {
        return createAt;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public List<Order> getOrders() {
        return orders;
    }

    public void setOrders(List<Order> orders) {
        this.orders = orders;
    }

    public boolean isBlack() {
        return isBlack;
    }

    public void setBlack(boolean black) {
        isBlack = black;
    }

    public List<Payment> getPayments() {
        return payments;
    }

    public void setPayments(List<Payment> payments) {
        this.payments = payments;
    }

    public List<PreOrder> getPreOrders() {
        return preOrders;
    }

    public void setPreOrders(List<PreOrder> preOrders) {
        this.preOrders = preOrders;
    }

    public List<Feedback> getFeedbacks() {
        return feedbacks;
    }

    public void setFeedbacks(List<Feedback> feedbacks) {
        this.feedbacks = feedbacks;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public List<Contract> getContracts() {
        return contracts;
    }

    public void setContracts(List<Contract> contracts) {
        this.contracts = contracts;
    }

    public List<TestDrive> getTestDrives() {
        return testDrives;
    }

    public void setTestDrives(List<TestDrive> testDrives) {
        this.testDrives = testDrives;
    }

    public Dealer getDealer() {
        return dealer;
    }

    public void setDealer(Dealer dealer) {
        this.dealer = dealer;
    }

    public UserStatus getStatus() {
        return status;
    }

    public void setStatus(UserStatus status) {
        this.status = status;
    }

    public List<TestDrive> getEscortedTestDrives() {
        return escortedTestDrives;
    }

    public void setEscortedTestDrives(List<TestDrive> escortedTestDrives) {
        this.escortedTestDrives = escortedTestDrives;
    }
}
