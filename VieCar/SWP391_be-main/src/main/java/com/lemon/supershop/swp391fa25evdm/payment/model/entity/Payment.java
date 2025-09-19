package com.lemon.supershop.swp391fa25evdm.payment.model.entity;

import com.lemon.supershop.swp391fa25evdm.order.model.entity.Order;
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

    @Column(name = "Method", nullable = false, columnDefinition = "NVARCHAR(50)")
    private String method;

    @Column(name = "Paid_status", nullable = false, columnDefinition = "VARCHAR(20)")
    private boolean paid_status = false;

    @Column(name = "Paid_at", nullable = false, columnDefinition = "DATETIME2")
    private Date paid_at;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "OrderId")
    private Order order;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "PreOrderId")
    private PreOrder preOrder;

    @ManyToOne
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

    public boolean isPaid_status() {
        return paid_status;
    }

    public void setPaid_status(boolean paid_status) {
        this.paid_status = paid_status;
    }

    public Date getPaid_at() {
        return paid_at;
    }

    public void setPaid_at(Date paid_at) {
        this.paid_at = paid_at;
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
}
