package com.lemon.supershop.swp391fa25evdm.order.repository;

import com.lemon.supershop.swp391fa25evdm.order.model.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepo extends JpaRepository<Order, Integer> {
    List<Order> findByUserId(int Id);
    List<Order> findByDealerId(int dealerId);
}
