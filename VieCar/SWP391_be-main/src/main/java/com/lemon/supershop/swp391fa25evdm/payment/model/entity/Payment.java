package com.lemon.supershop.swp391fa25evdm.payment.model.entity;

import com.lemon.supershop.swp391fa25evdm.order.model.entity.Order;
import com.lemon.supershop.swp391fa25evdm.payment.model.enums.PaymentStatus;
import com.lemon.supershop.swp391fa25evdm.preorder.model.entity.PreOrder;
import com.lemon.supershop.swp391fa25evdm.user.model.entity.User;
import jakarta.persistence.*;

import java.util.Date;

@Entity
@Table(name = "payment")
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Id", columnDefinition = "BIGINT")
    private int id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "UserId")
    private User user;

    @Column(name = "Method", columnDefinition = "NVARCHAR(50)")
    private String method;

    @Column(name = "PaidStatus", columnDefinition = "VARCHAR(20)")
    @Enumerated(EnumType.STRING)
    private PaymentStatus paidStatus;

    @Column(name = "PaidAt", columnDefinition = "DATETIME2")
    private Date paidAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "OrderId")
    private Order order;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "PreOrderId")
    private PreOrder preOrder;

    @OneToOne
    @JoinColumn(name = "InsPaymentId")
    private InstallmentPayment installmentPayment;

    public Payment() {}

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getMethod() {
        return method;
    }

    public void setMethod(String method) {
        this.method = method;
    }

    public PaymentStatus getPaidStatus() {
        return paidStatus;
    }

    public void setPaidStatus(PaymentStatus paidStatus) {
        this.paidStatus = paidStatus;
    }

    public Date getPaidAt() {
        return paidAt;
    }

    public void setPaidAt(Date paidAt) {
        this.paidAt = paidAt;
    }

    public Order getOrder() {
        return order;
    }

    public void setOrder(Order order) {
        this.order = order;
    }

    public InstallmentPayment getInstallmentPayment() {
        return installmentPayment;
    }

    public void setInstallmentPayment(InstallmentPayment installmentPayment) {
        this.installmentPayment = installmentPayment;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public PreOrder getPreOrder() {
        return preOrder;
    }

    public void setPreOrder(PreOrder preOrder) {
        this.preOrder = preOrder;
    }
}
