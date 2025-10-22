package com.lemon.supershop.swp391fa25evdm.distribution.model.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.lemon.supershop.swp391fa25evdm.category.model.entity.Category;
import com.lemon.supershop.swp391fa25evdm.contract.model.entity.Contract;
import com.lemon.supershop.swp391fa25evdm.dealer.model.entity.Dealer;

import com.lemon.supershop.swp391fa25evdm.product.model.entity.Product;
import jakarta.persistence.*;
import lombok.Data;

import java.util.List;


@Entity
@Table(name = "distribution")
public class Distribution {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Id", columnDefinition = "BIGINT")
    private int id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "CategoryId")
    @JsonIgnore
    private Category category;

    @OneToMany(mappedBy = "distribution", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private List<Product> products;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "RoleId")
    private Dealer dealer;

    @OneToOne(mappedBy = "distribution")
    private Contract contract;

    public Distribution() {}

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public Category getCategory() {
        return category;
    }

    public void setCategory(Category category) {
        this.category = category;
    }

    public Dealer getDealer() {
        return dealer;
    }

    public void setDealer(Dealer dealer) {
        this.dealer = dealer;
    }

    public Contract getContract() {
        return contract;
    }

    public void setContract(Contract contract) {
        this.contract = contract;
    }

    public List<Product> getProducts() {
        return products;
    }

    public void setProducts(List<Product> products) {
        this.products = products;
    }
}
