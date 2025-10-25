package com.lemon.supershop.swp391fa25evdm.payment.repository;

import com.lemon.supershop.swp391fa25evdm.payment.model.entity.InstallmentPayment;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
@Repository
public interface InsPaymentRepo extends JpaRepository<InstallmentPayment, Integer> {
    Optional<InstallmentPayment> findById(int id);
    List<InstallmentPayment> findByInstallmentPlan_Id(int id);
    @Modifying
    @Transactional
    @Query("DELETE FROM InstallmentPayment ip WHERE ip.installmentPlan.id = :planId")
    void deleteByPlanId(@Param("planId") int planId);

}
