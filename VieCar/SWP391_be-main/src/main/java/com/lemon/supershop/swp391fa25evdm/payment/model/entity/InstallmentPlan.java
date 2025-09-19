package com.lemon.supershop.swp391fa25evdm.payment.model.entity;

import com.lemon.supershop.swp391fa25evdm.order.model.entity.Order;
import jakarta.persistence.*;

import java.util.List;

@Entity
@Table(name = "installment_plans")
public class InstallmentPlan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Id", columnDefinition = "BIGINT")
    private int id;

    @Column(name = "Months", columnDefinition = "INT")
    private int months;

    @Column(name = "InterestRate", columnDefinition = "DECIMAL(18,2)")
    private double interestRate;

    @OneToOne
    @JoinColumn(name = "OrderId", nullable = false)
    private Order order;

    @OneToMany(mappedBy = "installmentPlan", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<InstallmentPayment> inspayments;

    public InstallmentPlan() {}

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public int getMonths() {
        return months;
    }

    public void setMonths(int months) {
        this.months = months;
    }

    public double getInterestRate() {
        return interestRate;
    }

    public void setInterestRate(double interestRate) {
        this.interestRate = interestRate;
    }

    public Order getOrder() {
        return order;
    }

    public void setOrder(Order order) {
        this.order = order;
    }

    public List<InstallmentPayment> getInspayments() {
        return inspayments;
    }

    public void setInspayments(List<InstallmentPayment> installments) {
        this.inspayments = installments;
    }
}
