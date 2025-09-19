package com.lemon.supershop.swp391fa25evdm.order.model.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.lemon.supershop.swp391fa25evdm.preorder.model.entity.PreOrder;
import com.lemon.supershop.swp391fa25evdm.product.model.entity.Product;
import jakarta.persistence.*;

@Entity
@Table(name = "orderitem")
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Id", columnDefinition = "BIGINT")
    private int id;

    @ManyToOne
    @JoinColumn(name = "OrderId")
    @JsonIgnore
    private Order order;

    @ManyToOne
    @JoinColumn(name = "PreOrderId")
    @JsonIgnore
    private PreOrder preOrder;

    @ManyToOne
    @JoinColumn(name = "ProductId")
    @JsonIgnore
    private Product product;

    @Column(name = "Quantity", nullable = false, columnDefinition = "INT")
    private int quantity;

    @Column(name = "Price", nullable = false, columnDefinition = "DECIMAL(18,2)")
    private double price;

    public OrderItem() {}

    public OrderItem(int id, int quantity, double price) {
        this.id = id;
        this.quantity = quantity;
        this.price = price;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public Order getOrder() {
        return order;
    }

    public void setOrder(Order order) {
        this.order = order;
    }

    public Product getProduct() {
        return product;
    }

    public void setProduct(Product product) {
        this.product = product;
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }

    public double getPrice() {
        return price;
    }

    public void setPrice(double price) {
        this.price = price;
    }
}
