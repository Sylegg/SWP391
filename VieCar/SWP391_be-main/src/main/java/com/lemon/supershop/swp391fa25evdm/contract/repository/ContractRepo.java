package com.lemon.supershop.swp391fa25evdm.contract.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.lemon.supershop.swp391fa25evdm.contract.model.entity.Contract;

@Repository
public interface ContractRepo extends JpaRepository<Contract, Integer> {
    
    @Query("SELECT c FROM Contract c LEFT JOIN FETCH c.order LEFT JOIN FETCH c.user")
    List<Contract> findAll();

    List<Contract> findByUserId(int userId);
    
    @Query("SELECT c FROM Contract c JOIN c.order o WHERE o.id = :orderId")
    List<Contract> findByOrderId(@Param("orderId") int orderId);
    
    List<Contract> findByStatus(String status);
}
