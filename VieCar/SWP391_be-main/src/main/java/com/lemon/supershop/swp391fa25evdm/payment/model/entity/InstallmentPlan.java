package com.lemon.supershop.swp391fa25evdm.payment.model.entity;

import com.lemon.supershop.swp391fa25evdm.dealer.model.entity.Dealer;
import com.lemon.supershop.swp391fa25evdm.product.model.entity.Product;
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
    @JoinColumn(name = "ProductId")
    private Product product;

    @OneToMany(mappedBy = "installmentPlan", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<InstallmentPayment> inspayments;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "DealerId")
    private Dealer dealer;

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

    public Product getProduct() {
        return product;
    }

    public void setProduct(Product product) {
        this.product = product;
    }

    public List<InstallmentPayment> getInspayments() {
        return inspayments;
    }

    public void setInspayments(List<InstallmentPayment> installments) {
        this.inspayments = installments;
    }

    public Dealer getDealer() {
        return dealer;
    }

    public void setDealer(Dealer dealer) {
        this.dealer = dealer;
    }
}
