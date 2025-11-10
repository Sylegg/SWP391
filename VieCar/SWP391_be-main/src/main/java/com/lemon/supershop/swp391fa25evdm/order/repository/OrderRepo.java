package com.lemon.supershop.swp391fa25evdm.order.repository;

import com.lemon.supershop.swp391fa25evdm.order.model.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepo extends JpaRepository<Order, Integer> {
    List<Order> findByUserId(int Id);
    
    // ⭐ Fix: Query theo dealer.id thay vì dealerId
    @Query("SELECT o FROM Order o WHERE o.dealer.id = :dealerId")
    List<Order> findByDealerId(@Param("dealerId") int dealerId);
}
