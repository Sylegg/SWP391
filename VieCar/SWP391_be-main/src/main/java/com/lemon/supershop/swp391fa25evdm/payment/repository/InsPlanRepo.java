package com.lemon.supershop.swp391fa25evdm.payment.repository;

import com.lemon.supershop.swp391fa25evdm.payment.model.entity.InstallmentPlan;
import com.lemon.supershop.swp391fa25evdm.product.model.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
@Repository
public interface InsPlanRepo extends JpaRepository<InstallmentPlan, Integer> {
    List<InstallmentPlan> findByProductId(int id);
}
