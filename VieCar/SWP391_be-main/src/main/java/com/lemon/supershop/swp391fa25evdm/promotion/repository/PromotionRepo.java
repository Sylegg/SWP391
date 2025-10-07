package com.lemon.supershop.swp391fa25evdm.promotion.repository;

import com.lemon.supershop.swp391fa25evdm.promotion.model.entity.Promotion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PromotionRepo extends JpaRepository<Promotion, Integer> {
    List<Promotion> findByDealer_Id(int id);
}
