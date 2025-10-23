package com.lemon.supershop.swp391fa25evdm.preorder.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.lemon.supershop.swp391fa25evdm.preorder.model.entity.PreOrder;

@Repository
public interface PreOrderRepo extends JpaRepository<PreOrder, Integer> {
    List<PreOrder> findByUserId(int userId);
    List<PreOrder> findByStatus (String status);
    List<PreOrder> findByProductId (int productId);

}
